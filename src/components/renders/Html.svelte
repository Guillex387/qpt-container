<script lang="ts">
  import { sanitize } from 'dompurify';
  import { onDestroy, onMount } from 'svelte';
  import Center from '../utils/Center.svelte';
  import Loader from '../utils/Loader.svelte';

  export let src: string;
  let localDataUrl: string | null = null;

  const init = async () => {
    let response = await fetch(src);
    let dirty = await response.text();
    let staticHtml = sanitize(dirty);
    localDataUrl = URL.createObjectURL(new Blob([staticHtml], { type: 'text/html' }));
  };

  onMount(init);
  onDestroy(() => {
    URL.revokeObjectURL(localDataUrl);
  });
</script>

<div class="w-full h-full">
  {#if localDataUrl === null}
    <Center>
      <Loader />
    </Center>
  {:else}
    <embed class="w-full h-full bg-white" type="text/html" src={localDataUrl} />
  {/if}
</div>
