import { PluginProcess } from "./types/plugin";

export class ElectronPluginProcess implements PluginProcess {
    private win: any;

    private id: number;

    private running: boolean;

    private name: string;

    constructor(param: string | any, private onRemove: () => void) {
      if (typeof param === 'string') {
        this.name = param;
        this.running = false;
      } else {
        this.name = param.title;
        this.running = true;
        this.id = param.id;
        this.win = param;
        this.win.on('closed', () => {
          if (this.running) {
            this.onRemove();
            this.win = null;
          }
        });
      }
    }

    run(script: string) {
        const htmlContent = (`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${this.name}</title>
          <meta charset="UTF-8">
        </head>
        <body>
          <script>
          class Bridge {
            port
            onconnect;
            onmessage;
            ondisconnect;
            on(event, callback) {
              switch (event) {
                case 'connect': this.onconnect = callback; break;
                case 'message': this.onmessage = callback; break;
                case 'disconnect': this.ondisconnect = callback; break;
                default: throw Error("no such event listener: " + event);
              }
            }
            setPort(port) {
              this.port = port;
            }
            send(data) {
              if (!this.port) {
                throw Error("no port exist");
              }
              this.port.postMessage(data);
            }

          }
          const bridge = new Bridge();
          (function(b) {
            const { ipcRenderer } = require('electron');
            let port;
            ipcRenderer.on('connect', async (event, args) => {
              port = event.ports[0];
              bridge.setPort(port);
              bridge.onconnect && bridge.onconnect();

              port.onmessage = (e) => {
                bridge.onmessage && bridge.onmessage(e.data);
              }
            });
            ipcRenderer.on('disconnect', async (event, args) => {
              port = undefined;
              bridge.ondisconnect && bridge.ondisconnect();
            });
          })(bridge);

          (function(bridge) {
            ${script}
          })(bridge);
          
          </script>
        </body>
      </html>
    `);

        const url = 'data:text/html;charset=UTF-8,' + encodeURIComponent(htmlContent);
        const remote = require('@electron/remote');
        this.win = new remote.BrowserWindow({
            skipTaskbar: true,
            show: true,
            title: this.name,
            webPreferences: {
                devTools: true,
                nodeIntegration: true,
                webSecurity: true,
                contextIsolation: false,
            }
        });
        this.win.loadURL(url);
        this.running = true;
        this.id = this.win.id;
        this.win.on('closed', () => {
          this.running = false;
          this.onRemove();
          this.win = null;
        });
    }

    destroy() {
      if (this.win && this.running) {
        this.win.destroy();
        this.win = null;
        this.running = false;
      }
    }

    getId() {
      return this.id;
    }

    setId(id: number) {
      this.id = id;
    }

    setParentWindow(win: any) {
        this.win.setParentWindow(win);
    }

    getWindow() {
      return this.win;
    }
}
