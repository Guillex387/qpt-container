<script lang="ts">
  import { onDestroy } from 'svelte';
  import Center from './Center.svelte';
  import { loadedDisk, loadedDiskWorkPath } from '../globalState';

  let path: string[] = [];
  let diskName: string = '(Loading...)';

  let unsubscribeDisk = loadedDisk.subscribe(value => (diskName = value.name));
  let unsubscribePath = loadedDiskWorkPath.subscribe(value => (path = value));

  const navigate = (node: string) => {
    let index = path.findIndex(value => value === node);
    if (!node) {
      loadedDiskWorkPath.set([]);
    }
    loadedDiskWorkPath.update(value => {
      return value.slice(0, index + 1);
    });
  };

  onDestroy(() => {
    unsubscribeDisk();
    unsubscribePath();
  });
</script>

<div class="w-full h-full overflow-auto">
  <Center>
    <p on:click={() => navigate('')} class="inline select-none whitespace-nowrap cursor-pointer hover:text-white hover:underline">
      {diskName}:
    </p>
    {#each path ?? [] as node}
      <p class="inline select-none">/</p>
      <p
        on:click={() => navigate(node)}
        class="inline select-none whitespace-nowrap cursor-pointer hover:text-white hover:underline"
      >
        {node}
      </p>
    {/each}
  </Center>
</div>
