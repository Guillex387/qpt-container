<script lang="ts">
  import IconBtn from '../components/utils/IconBtn.svelte';
  import Center from '../components/utils/Center.svelte';
  import ArrowLeftSolid from '../icons/arrow-left-solid.svelte';
  import DiskNav from '../components/DiskNav.svelte';
  import SystemItemList from '../components/SystemItemList.svelte';
  import { page } from '../globalState';
</script>

<main class="fixed h-full w-full">
  <header class="flex items-center h-12 rounded-b-lg">
    <div on:click={() => page.set('home')} class="flex-none w-12 h-full hover-effect rounded-lg">
      <Center>
        <IconBtn>
          <ArrowLeftSolid />
        </IconBtn>
      </Center>
    </div>
    <DiskNav />
    <div class="flex-none w-12 h-full" />
  </header>
  <article class="flex justify-center px-20 pt-10">
    <div class="w-9/12" id="content">
      <SystemItemList />
    </div>
  </article>
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
