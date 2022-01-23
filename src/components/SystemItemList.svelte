<script lang="ts">
  import { onDestroy } from 'svelte';
  import SystemItemComponent from './SystemItemComponent.svelte';
  import { loadedDisk, loadedDiskWorkPath, page } from '../globalState';
  import DiskFileSystem from '../lib/disk/diskFileSystem';
  import { showErrorBox } from '../controllers/dialogs';

  let disk: DiskFileSystem | null = null;
  let workPath: string[] | null = null;

  let unsubscribeDisk = loadedDisk.subscribe(value => (disk = value));
  let unsubscribePath = loadedDiskWorkPath.subscribe(value => (workPath = value));

  const getFolderContent = async () => {
    try {
      return await disk.readFolder(workPath);
    } catch (error) {
      showErrorBox(error);
      page.set('home');
      return [];
    }
  };

  let itemsListPromise = getFolderContent();

  onDestroy(() => {
    unsubscribeDisk();
    unsubscribePath();
  });
</script>

<div id="container" class="px-16 pb-16 overflow-auto">
  {#await itemsListPromise}
    <div>Loading...</div>
    <!-- TODO: add loader -->
  {:then itemsList}
    {#each itemsList as item}
      <SystemItemComponent obj={item} />
    {/each}
  {/await}
</div>

<style>
  #container {
    height: calc(100vh - 8.5rem);
  }
</style>
