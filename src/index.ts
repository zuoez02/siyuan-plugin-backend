import { Menu, Plugin } from 'siyuan';
import { ProcessController } from './types/plugin';
import { ElectronProcessController } from './electron-process-controller';
import { ElectronCommunicationHandler } from './electron-communication-handler';

export default class BackendPlugin extends Plugin {
    processController: ProcessController;

    onload(): void {
        const icon = this.addTopBar({
            icon: 'iconBug',
            title: this.name,
            callback: () => {
                if (!this.processController) {
                    return;
                }
                const menu = new Menu();
                this.processController.getProcesses().forEach((k) => {
                    menu.addItem({
                        label: k,
                        click: () => {
                            this.reload(k);
                        }
                    })
                });
                const rect = icon.getBoundingClientRect();
                menu.open({
                    x: rect.right,
                    y: rect.bottom,
                    isLeft: true,
                })
            }
        })
    }

    async onLayoutReady() {
        try {
            require('@electron/remote');
            this.processController = new ElectronProcessController();
            console.log('load electron controller');
        } catch (e) {
            console.error('load electron failed', e);
            return;
        }

        if (this.processController) {
            for (const plugin of this.app.plugins) {
                if (this.processController.has(plugin.name)) {
                    continue;
                }
                const script = await this.getPluginScript(plugin.name);
                if (script) {
                    this.processController.load(plugin.name, script);
                }
            }
        }

        // self process
        const handler = new ElectronCommunicationHandler(this.processController as ElectronProcessController);
        const callback = await handler.listenToProcess(this.name, (event) => {
            const data = event.data;
            console.log(data);
            handler.sendToProcess(this.name, 'fuck you, too');
            callback();
        });
    }

    async reload(name: string) {
        this.processController.unload(name);
        const script = await this.getPluginScript(name);
        if (!script) {
            return;
        }
        this.processController.load(name, script);
    }

    onunload(): void {
        if (this.processController) {
            this.processController.unloadAll();
        }
        this.processController = null;
    }

    async getPluginScript(name: string): Promise<string | null> {
        return fetch('/api/file/getFile', {
            method: 'POST',
            body: JSON.stringify({ path: `/data/plugins/${name}/process.js` })
        }).then((res) => {
            if (res.status === 200) {
                return res.text();
            }
            return null
        });
    }
}
