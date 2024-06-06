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

export interface PluginLogger {
    info(val: string): void;
    warn(val: string): void;
    error(val: string): void;
    debug(val: string): void;
    start(): void;
    stop(): void;
}

export interface Process {
    name: string;
    running: boolean;
}

export interface BackendProcessPlugin {
    name: string;
    running: boolean;
    enabled: boolean;
    logger?: PluginLogger;
}