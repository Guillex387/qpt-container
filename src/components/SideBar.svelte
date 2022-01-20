<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { page } from '../globalState';

  let dispatcher = createEventDispatcher();

  function emitHide() {
    dispatcher('hide');
  }

  function navigate(name: string) {
    page.set(name);
  }

  export let visible: boolean;
</script>

{#if visible}
  <div transition:fly={{ x: -200, duration: 300 }} id="container" class="fixed h-screen top-0 left-0 rounded-r-lg z-50">
    <ul class="flex flex-col h-full">
      <li on:click={() => navigate('home')} class="p-5 w-72 mt-5 hover-effect">Home</li>
      <li on:click={() => navigate('config')} class="p-5 w-72 mt-5 hover-effect">Settings</li>
      <li on:click={() => navigate('license')} class="p-5 w-72 mt-auto mb-5 hover-effect">License & Copyright</li>
    </ul>
  </div>
  <div
    on:click={emitHide}
    transition:fade={{ duration: 300 }}
    class="fixed h-screen w-screen top-0 left-0 z-40 bg-black opacity-50"
  />
{/if}

<style>
  #container {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }
</style>
