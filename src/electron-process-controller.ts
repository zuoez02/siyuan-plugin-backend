import { PluginProcess, ProcessController } from "./types/plugin";
import { ElectronPluginProcess } from './electron-plugin-process';

export class ElectronProcessController implements ProcessController {
    processes: Map<string, ElectronPluginProcess>;
    currentWindow: BrowserWindow;
    ports: Map<string, any>
    cacheCallbacks: Map<string, any> = new Map();

    constructor() {
        this.processes = new Map();
        this.ports = new Map();
        this.restore();
        this.initCommunication();
    }

    has(name: string) {
        return this.processes.has(name);
    }

    getProcesses(): string[] {
        return [...this.processes.keys()];
    }

    getProcess(name: string): PluginProcess {
        return this.processes.get(name);
    }

    getPort(name: string) {
        return this.ports.get(name);
    }

    load(pluginName: string, script: string) {
        const process = new ElectronPluginProcess(pluginName, () => this.unload(pluginName));
        process.run(script);
        process.setParentWindow(this.currentWindow);
        this.processes.set(pluginName, process);
        this.connect(pluginName);
    }

    reload(plugin: string, script: string) {
        this.unload(plugin);
        this.load(plugin, script);
    }

    unload(plugin: string) {
        const p = this.processes.get(plugin);
        if (p) {
            p.destroy();
            this.processes.delete(plugin);
            this.disconnect(plugin);
        }
    }

    restore() {
        const remote = require('@electron/remote');
        this.currentWindow = remote.getCurrentWindow();
        const children: BrowserWindow[] = this.currentWindow.getChildWindows();
        children.forEach((b) => {
            const title = b.title;
            this.processes.set(title, new ElectronPluginProcess(b, () => this.unload(title)));
        })
    }

    unloadAll() {
        this.processes.forEach((process, name) => {
            this.unload(name);
        })
    }

    initCommunication() {
        this.getProcesses().forEach((name) => {
            this.connect(name);
        });
    }

    connect(name) {
        const { MessageChannelMain } = require('@electron/remote');
        const { port1, port2 } = new MessageChannelMain();
        let re;
        const promise = new Promise((resolve) => {
           re = resolve;
        })
        this.ports.set(name, promise);
        port1.name = name;
        const { ipcRenderer } = require('electron');
        
        ipcRenderer.once('connect:'+name, (event) => {
            const p = event.ports[0];
            this.ports.set(name, p);
            if (this.cacheCallbacks.get(name)) {
                console.log('reconnect to plugin host: ' + name)
                p.onmessage = this.cacheCallbacks.get(name);
                this.cacheCallbacks.delete(name);
            }
          })
        
        require('@electron/remote').getCurrentWindow().webContents.postMessage("connect:"+name, null, [port1]);
        const processWindow = this.processes.get(name).getWindow();
        if (processWindow.isEnabled()) {
            processWindow.webContents.postMessage("connect", null, [port2]);
            return;
        }
        processWindow.once('ready-to-show', () => {
            processWindow.webContents.postMessage('connect', null, [port2])
        })
    }

    disconnect(name) {
        const port = this.ports.get(name);
        this.ports.delete(name);
        const onmessage = port.onmessage;
        this.cacheCallbacks.set(name, onmessage);
    }
}