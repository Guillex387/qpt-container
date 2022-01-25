<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { page } from '../../globalState';
  import Center from './utils/Center.svelte';
  import IconBtn from './utils/IconBtn.svelte';
  import BarsSolid from '../icons/bars-solid.svelte';

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
  <div
    transition:fly={{ x: -200, duration: 300 }}
    id="container"
    class="fixed h-screen top-0 left-0 rounded-r-lg z-20 flex flex-col"
  >
    <div class="flex-none flex items-center h-12 rounded-b-lg">
      <div on:click={emitHide} class="flex-none w-12 h-full hover-effect rounded-lg">
        <Center>
          <IconBtn>
            <BarsSolid />
          </IconBtn>
        </Center>
      </div>
    </div>
    <ul class="flex flex-col h-full">
      <li on:click={() => navigate('home')} class="p-5 w-72 my-2 hover-effect rounded-lg">Home</li>
      <li on:click={() => navigate('settings')} class="p-5 w-72 my-2 hover-effect rounded-lg">Settings</li>
      <li on:click={() => navigate('license')} class="p-5 w-72 mt-auto mb-2 hover-effect rounded-lg">License & Copyright</li>
    </ul>
  </div>
  <div
    on:click={emitHide}
    transition:fade={{ duration: 300 }}
    class="fixed h-screen w-screen top-0 left-0 z-10 bg-black opacity-50"
  />
{/if}

<style>
  #container {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }
</style>
