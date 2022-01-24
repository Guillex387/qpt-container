<script lang="ts">
  import IconBtn from '../components/IconBtn.svelte';
  import Center from '../components/Center.svelte';
  import BarsSolid from '../icons/bars-solid.svelte';
  import SideBar from '../components/SideBar.svelte';
  import DiskList from '../components/DiskList.svelte';

  let visibleSideBar = false;
  const showSideBar = () => (visibleSideBar = true);
  const hideSideBar = () => (visibleSideBar = false);
</script>

<main class="fixed h-full w-full">
  <header class="flex items-center h-12 rounded-b-lg">
    <div on:click={showSideBar} class="flex-none w-12 h-full hover-effect rounded-lg">
      <Center>
        <IconBtn>
          <BarsSolid />
        </IconBtn>
      </Center>
    </div>
    <p class="w-full text-center">Home</p>
    <div class="flex-none w-12 h-full" />
  </header>
  <article class="flex justify-center px-20 pt-10">
    <div class="w-9/12" id="content">
      <DiskList />
    </div>
  </article>
  <SideBar on:hide={hideSideBar} visible={visibleSideBar} />
</main>

<style>
  header {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }

  article {
    height: calc(100vh - 3rem);
  }

  #content {
    min-width: 20rem;
  }
</style>
