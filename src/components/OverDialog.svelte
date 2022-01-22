<script lang="ts">
  import Center from './Center.svelte';
  import { fade, fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { clickOutside } from '../utils/ClickOutSide';

  let dispatcher = createEventDispatcher();

  const emitHide = () => dispatcher('hide');

  export let visible: boolean = false;
</script>

{#if visible}
  <div transition:fly={{ x: -200, duration: 300 }} class="fixed h-screen w-screen top-0 left-0 z-40">
    <Center>
      <div use:clickOutside={emitHide} id="container" class="rounded-lg">
        <slot />
      </div>
    </Center>
  </div>
  <div transition:fade={{ duration: 300 }} class="fixed h-screen w-screen top-0 left-0 z-30 bg-black opacity-50" />
{/if}

<style>
  #container {
    width: 70%;
    height: 60%;
    background: #373c3f;
  }
</style>
