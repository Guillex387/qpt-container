<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Center from './Center.svelte';
  import HddSolid from '../icons/hdd-solid.svelte';
  import IconBtn from './IconBtn.svelte';
  import DropDown from './DropDown.svelte';
  import MenuItem from './MenuItem.svelte';

  let dispatcher = createEventDispatcher();

  function openDisk() {
    dispatcher('open', { name });
  }

  let visibleMenu = false;
  const showMenu = () => (visibleMenu = true);
  const hideMenu = () => (visibleMenu = false);

  export let name: string;
</script>

<div class="m-5 flex items-center h-12 rounded-lg" id="container">
  <div class="flex-none w-12 h-full">
    <Center>
      <IconBtn pointer={false}>
        <HddSolid />
      </IconBtn>
    </Center>
  </div>
  <p on:dblclick={openDisk} class="w-full text-left truncate text-white cursor-pointer select-none">{name}</p>
  <div class="flex-none w-12 h-full icon-hover rounded-lg">
    <DropDown visible={visibleMenu} on:show={showMenu} on:hide={hideMenu}>
      <MenuItem on:click={hideMenu} text="Option 1" />
      <MenuItem on:click={hideMenu} text="Option 2" />
      <MenuItem on:click={hideMenu} text="Option 3" />
      <MenuItem on:click={hideMenu} text="Option 4" />
      <MenuItem on:click={hideMenu} text="Option 5" />
    </DropDown>
  </div>
</div>

<style>
  #container {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }
</style>
