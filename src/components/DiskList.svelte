<script lang="ts">
  import { onDestroy } from 'svelte';
  import DiskComponent from './DiskComponent.svelte';
  import { DisksData } from '../controllers/disksManager';
  import { disks } from '../globalState';

  let disksState: DisksData | null = null;
  $: diskList = disksState && Object.keys(disksState);

  let unsubscribe = disks.subscribe(value => (disksState = value));

  function onOpen(disk: string) {
    console.log(disksState[disk]);
  }

  onDestroy(unsubscribe);
</script>

<div id="container" class="px-16 pb-16 max-h-full overflow-auto">
  {#if disksState === null}
    <div>Loading...</div>
  {:else}
    {#each diskList as diskName}
      <DiskComponent on:open={() => onOpen(diskName)} name={diskName} />
    {/each}
  {/if}
</div>

<style>
  #container {
    height: calc(100vh - 8.5rem);
  }
</style>
