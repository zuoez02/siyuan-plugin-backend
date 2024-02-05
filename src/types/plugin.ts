export interface ProcessController {
    restore();
    getProcesses(): string[];
    getProcess(name: string): PluginProcess
    has(name: string): boolean;
    load(name: string, script: string);
    unload(name: string);
    reload(name: string, script: string);
    unloadAll();
}

export interface PluginProcess {
    run(script: string);
    destroy();
    getId();
    setId(id: number);
}