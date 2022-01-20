<script lang="ts">
  import IconBtn from '../components/IconBtn.svelte';
  import Center from '../components/Center.svelte';
  import EllipsisHSolid from '../icons/ellipsis-h-solid.svelte';
  import BarsSolid from '../icons/bars-solid.svelte';
  import FileImportSolid from '../icons/file-import-solid.svelte';
  import PlusCircleSolid from '../icons/plus-circle-solid.svelte';
  import RedoAltSolid from '../icons/redo-alt-solid.svelte';
  import SideBar from '../components/SideBar.svelte';
  import DropDown from '../components/DropDown.svelte';
  // import DiskList from '../components/DiskList.svelte';

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
    <div class="flex-none w-12 h-full">
      <DropDown>
        <li class="py-2 px-6 text-center hover-effect rounded-lg">Test_1</li>
        <li class="py-2 px-6 text-center hover-effect rounded-lg">Test_2</li>
      </DropDown>
    </div>
  </header>
  <article class="flex justify-center px-20 pt-10">
    <div class="w-9/12" id="content">
      <div class="flex h-12" id="top-menu">
        <div class="flex-none w-12 hover-effect rounded-lg">
          <Center>
            <IconBtn>
              <FileImportSolid />
            </IconBtn>
          </Center>
        </div>
        <div class="flex-none w-12 hover-effect rounded-lg">
          <Center>
            <IconBtn>
              <PlusCircleSolid />
            </IconBtn>
          </Center>
        </div>
        <div class="ml-auto flex-none w-12 hover-effect rounded-lg">
          <Center>
            <IconBtn>
              <RedoAltSolid />
            </IconBtn>
          </Center>
        </div>
      </div>
      <hr />
      <!-- <DiskList disks={[]} /> -->
    </div>
  </article>
  <SideBar on:hide={hideSideBar} visible={visibleSideBar} />
</main>

<style>
  header {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }
  hr {
    height: 1px;
    background: #4d4d4d;
    border: none;
  }

  #content {
    min-width: 20rem;
  }
</style>
