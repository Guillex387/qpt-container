<script lang="ts">
  import IconBtn from '../components/utils/IconBtn.svelte';
  import Center from '../components/utils/Center.svelte';
  import BarsSolid from '../icons/bars-solid.svelte';
  import SideBar from '../components/SideBar.svelte';
  import { platform, arch } from 'os';

  let visibleSideBar = false;
  function showSideBar() {
    visibleSideBar = true;
  }
  function hideSideBar() {
    visibleSideBar = false;
  }
</script>

<main class="fixed h-full w-full">
  <header class="flex items-center h-12 rounded-b-lg">
    <div on:click={showSideBar} class="flex-none w-12 h-full hover-effect rounded-b-lg">
      <Center>
        <IconBtn>
          <BarsSolid />
        </IconBtn>
      </Center>
    </div>
    <p class="w-full text-center">Settings</p>
    <div class="flex-none w-12 h-full" />
  </header>
  <article class="flex flex-col text-sm opacity-50 text-center">
    <div class="flex pt-4">
      <ul class="w-full p-2">
        <li>Program name &bull; {process.env.npm_package_name}</li>
        <li>Version &bull; {process.env.npm_package_version}</li>
        <li>Description &bull; {process.env.npm_package_description}</li>
      </ul>
      <ul class="w-full p-2">
        <li>Platform &bull; {platform()}</li>
        <li>Arch &bull; {arch()}</li>
        <li>Mode &bull; {process.env.PORTABLE === 'true' ? 'portable' : 'normal'}</li>
      </ul>
    </div>
  </article>
  <SideBar on:hide={hideSideBar} visible={visibleSideBar} />
</main>

<style>
  header {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }
</style>
