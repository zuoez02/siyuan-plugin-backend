<script lang="ts">
  import BackendPlugin from "..";
  import { onMount } from 'svelte';

  let processes: string[] = [];

  onMount(() => {
    processes = plugin.processController.getProcesses();
  })
  
  const sendMessage = () => plugin.sendMessage();

  export let plugin: BackendPlugin;
</script>

<h1>Backend monitor</h1>

<section>
    <h2>Process Controller</h2>
    <div class="processes">
        {#each processes as process}  
        <div class="process">
            <span class="process-name" on:click={() => sendMessage()}>{process}</span>
            <svg><use xlink:href="#iconPlay"></use></svg>
        </div>
        {/each}
    </div>
</section>
<section>
    <h2>Log</h2>
</section>