import { Plugin, openTab } from 'siyuan';
import Tab from './views/tab.svelte';
import { ProcessManager } from './process/manager';
import "./index.scss";

const TAB_TYPE = "PROCCESSES";

export default class BackendPlugin extends Plugin {
    processManager: ProcessManager;

    onload(): void {
        this.processManager = new ProcessManager(this);

        this.processManager.init('electron');

        this.addTopBar({
            icon: 'iconBug',
            title: this.i18n.tabTitle,
            callback: () => {
                const tab = openTab({
                    app: this.app,
                    custom: {
                        title: this.i18n.tabTitle,
                        icon: 'iconBug',
                        id: this.name + TAB_TYPE,
                    }
                })
            }
        });

        const plugin = this;

        this.addTab({
            type: TAB_TYPE,
            init() {
                new Tab({
                    target: this.element,
                    props: {
                        plugin,
                        manager: plugin.processManager,
                    }
                })
            }
        })
    }
}
