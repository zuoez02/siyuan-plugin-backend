class ElectronProcessLogger {
    log(...message: any[]) {
        console.log(...message);
    }

    info(...message: any[]) {
        console.info(...message);
    }

    warn(...message: any[]) {
        console.warn(...message);
    }

    error(...message: any[]) {
        console.error(...message);
    }
}