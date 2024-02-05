import { PluginProcess } from "./types/plugin";

export class ElectronPluginProcess implements PluginProcess {
    private win: BrowserWindow;

    private id: number;

    private running: boolean;

    private name: string;

    constructor(param: string | BrowserWindow, private onRemove: () => void) {
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
          ${script}
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
        console.log('electron-plugin-process: create window: ' + this.win.id);
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

    setParentWindow(win: BrowserWindow) {
        this.win.setParentWindow(win);
    }

    getWindow() {
      return this.win;
    }
}
