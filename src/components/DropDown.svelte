<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale } from 'svelte/transition';
  import IconBtn from './IconBtn.svelte';
  import EllipsisHSolid from '../icons/ellipsis-h-solid.svelte';
  import { clickOutside } from '../utils/ClickOutSide';
  import Center from './Center.svelte';

  let dispatcher = createEventDispatcher();

  const showMenu = () => dispatcher('show');
  const outSideClick = () => dispatcher('hide');

  export let visible: boolean;
</script>

<div class="relative inline-block w-full h-full">
  <div on:click={showMenu} class="w-full h-full hover-effect rounded-lg">
    <Center>
      <IconBtn>
        <EllipsisHSolid />
      </IconBtn>
    </Center>
  </div>
  {#if visible}
    <ul
      use:clickOutside={outSideClick}
      id="menu"
      transition:scale={{ duration: 300 }}
      class="origin-top-right absolute right-0 mt-2 rounded-lg m-2 z-30"
    >
      <slot />
    </ul>
  {/if}
</div>

<style>
  #menu {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
    color: #b2b2b2;
    border: 1px solid #4d4d4d;
  }
</style>
