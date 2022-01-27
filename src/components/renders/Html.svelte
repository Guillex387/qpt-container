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
    localDataUrl = URL.createObjectURL(new Blob([staticHtml]));
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
    <iframe class="w-full h-full" title="Html preview" src={localDataUrl} />
  {/if}
</div>
