<script lang="ts">
  import Center from './Center.svelte';
  import HddSolid from '../icons/hdd-solid.svelte';
  import EllipsisHSolid from '../icons/ellipsis-h-solid.svelte';
  import IconBtn from './IconBtn.svelte';
  import { createEventDispatcher } from 'svelte';

  export let name: string;
  let dispatcher = createEventDispatcher();

  function onDoubleClick() {
    dispatcher('open', name);
  }
</script>

<div class="flex items-center h-12 rounded-lg" id="container">
  <div class="flex-none w-12 h-full">
    <Center>
      <IconBtn pointer={false}>
        <HddSolid />
      </IconBtn>
    </Center>
  </div>
  <p
    on:dblclick={onDoubleClick}
    class="w-full text-left truncate text-white cursor-pointer"
  >
    {name}
  </p>
  <div class="flex-none w-12 h-full icon-hover rounded-lg">
    <Center>
      <IconBtn>
        <EllipsisHSolid />
      </IconBtn>
    </Center>
  </div>
</div>

<style>
  #container {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
    width: 60rem;
  }
</style>
