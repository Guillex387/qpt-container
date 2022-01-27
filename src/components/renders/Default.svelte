<script lang="ts">
  import { onMount } from 'svelte';

  export let src: string;
  let plainText: string;

  const init = async () => {
    let response = await fetch(src);
    plainText = await response.text();
  };

  onMount(init);
</script>

<pre class="w-full h-full bg-white text-black overflow-auto p-4">
  {plainText}
</pre>

<style>
  pre {
    font-family: monospace;
  }
</style>
