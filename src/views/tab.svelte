<script lang="ts">
  import { ProcessManager } from "@/process/manager";
  import { onMount } from "svelte";
  import { BackendProcessPlugin } from "@/types/plugin";
  import BackendPlugin from "..";

  let plugins: BackendProcessPlugin[] = [];

  let timer;

  onMount(() => {
    plugins = manager.getBackendPlugins();

    timer = setInterval(() => refresh(), 1000);

    return () => clearInterval(timer);
  });

  const refresh = () => {
    plugins = [...manager.getBackendPlugins()];
  };

  const reloadPlugin = async (name: string) => {
    await plugin.processManager.reload(name);
    refresh();
  };

  const unloadPlugin = async (name: string) => {
    plugin.processManager.unload(name);
    refresh();
  };

  const toggleLogger = (name: string) => {
    manager.toggleLogger(name);
  }

  export let plugin: BackendPlugin;
  export let manager: ProcessManager;
</script>

<div class="process-tab">
  <h2>{plugin.i18n.tabTitle}</h2>

  <section class="process-tab-section">
    <h3>{plugin.i18n.tabSectionProcesses}</h3>
    <div class="processes">
      <table>
        {#each plugins as bp}
          <tr>
            <td>
              <svg
                class={"process-icon " +
                  (bp.running ? "process-running" : "process-stopped")}
                ><use xlink:href="#iconDot"></use></svg
              >
            </td>
            <td>
              <span class="process-name">{bp.name} </span>
            </td>
            <td
              ><span class="process-name"
                >{bp.running
                  ? plugin.i18n.processRunning
                  : plugin.i18n.processStopped}</span
              ></td
            >
            <td>
              <svg class="process-icon" on:click={() => reloadPlugin(bp.name)}
                ><use xlink:href="#iconRefresh"></use></svg
              >
              <svg class="process-icon" on:click={() => unloadPlugin(bp.name)}
                ><use xlink:href="#iconClose"></use></svg
              >
              <svg class="process-icon" on:click={() => toggleLogger(bp.name)}
                ><use xlink:href="#iconTerminal"></use></svg
              >
            </td>
          </tr>
        {/each}
      </table>
    </div>
  </section>
</div>
