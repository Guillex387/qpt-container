<script lang="ts">
  import IconBtn from '../components/IconBtn.svelte';
  import Center from '../components/Center.svelte';
  import FileImportSolid from '../icons/file-import-solid.svelte';
  import FileMedicalSolid from '../icons/file-medical-solid.svelte';
  import FolderPlusSolid from '../icons/folder-plus-solid.svelte';
  import RedoAltSolid from '../icons/redo-alt-solid.svelte';
  import ArrowLeftSolid from '../icons/arrow-left-solid.svelte';
  import DropDown from '../components/DropDown.svelte';
  import MenuItem from '../components/MenuItem.svelte';
  import DiskNav from '../components/DiskNav.svelte';
  import SystemItemList from '../components/SystemItemList.svelte';

  let visibleMenu = false;
  const showMenu = () => (visibleMenu = true);
  const hideMenu = () => (visibleMenu = false);
</script>

<main class="fixed h-full w-full">
  <header class="flex items-center h-12 rounded-b-lg">
    <div class="flex-none w-12 h-full hover-effect rounded-lg">
      <Center>
        <IconBtn>
          <ArrowLeftSolid />
        </IconBtn>
      </Center>
    </div>
    <!-- TODO: <DiskNav /> -->
    <div class="flex-none w-12 h-full">
      <DropDown visible={visibleMenu} on:show={showMenu} on:hide={hideMenu}>
        <MenuItem on:click={hideMenu} text="Option 1" />
        <MenuItem on:click={hideMenu} text="Option 2" />
        <MenuItem on:click={hideMenu} text="Option 3" />
        <MenuItem on:click={hideMenu} text="Option 4" />
        <MenuItem on:click={hideMenu} text="Option 5" />
        <!-- TODO: edit menu item -->
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
            <IconBtn width={'1rem'}>
              <FileMedicalSolid />
            </IconBtn>
          </Center>
        </div>
        <div class="flex-none w-12 hover-effect rounded-lg">
          <Center>
            <IconBtn>
              <FolderPlusSolid />
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
      <!-- TODO: <SystemItemList /> -->
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
  #top-menu {
    border-bottom: 1px solid #4d4d4d;
  }
</style>
