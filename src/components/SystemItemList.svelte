<script lang="ts">
  import { onDestroy } from 'svelte';
  import SystemItemComponent from './SystemItemComponent.svelte';
  import { loadedDisk, loadedDiskWorkPath, page } from '../globalState';
  import DiskFileSystem, { File } from '../lib/disk/diskFileSystem';
  import { showErrorBox, showOpenBox } from '../controllers/dialogs';
  import Center from './utils/Center.svelte';
  import IconBtn from './utils/IconBtn.svelte';
  import FileImportSolid from '../icons/file-import-solid.svelte';
  import FileMedicalSolid from '../icons/file-medical-solid.svelte';
  import FolderPlusSolid from '../icons/folder-plus-solid.svelte';
  import RedoAltSolid from '../icons/redo-alt-solid.svelte';
  import * as path from 'path';
  import * as fs from 'fs';
  import OverDialog from './overlays/OverDialog.svelte';
  import InputForm from './forms/InputForm.svelte';
  import Loader from './utils/Loader.svelte';

  let disk: DiskFileSystem | null = null;
  let workPath: string[] | null = null;

  const getFolderContent = async () => {
    try {
      return disk.readFolder(workPath);
    } catch (error) {
      showErrorBox(error);
      page.set('home');
      return [];
    }
  };

  let itemsListPromise: Promise<File[]> | null = null;

  let unsubscribeDisk = loadedDisk.subscribe(value => {
    disk = value;
    if (disk && workPath) itemsListPromise = getFolderContent();
  });

  let unsubscribePath = loadedDiskWorkPath.subscribe(value => {
    workPath = value;
    if (disk && workPath) itemsListPromise = getFolderContent();
  });

  let visibleDialog = false;
  let dialogAction = 'file';
  const showDialog = () => (visibleDialog = true);
  const hideDialog = () => (visibleDialog = false);

  const uploadFile = async () => {
    try {
      let uploadFiles = showOpenBox(true, [{ name: 'All files', extensions: ['*'] }]);
      if (uploadFiles) {
        for (const file of uploadFiles) {
          let name = path.basename(file);
          let content = fs.readFileSync(file);
          disk.createFile([...workPath, name], content);
        }
      }
    } catch (error) {
      showErrorBox(error);
    }
    itemsListPromise = getFolderContent();
  };

  const createFile = async (name: string) => {
    hideDialog();
    try {
      disk.createFile([...workPath, name], Buffer.alloc(0));
    } catch (error) {
      showErrorBox(error);
    }
    itemsListPromise = getFolderContent();
  };

  const createFolder = async (name: string) => {
    hideDialog();
    try {
      disk.createFolder([...workPath, name]);
    } catch (error) {
      showErrorBox(error);
    }
    itemsListPromise = getFolderContent();
  };

  onDestroy(() => {
    unsubscribeDisk();
    unsubscribePath();
  });
</script>

<div>
  <div class="flex h-12" id="top-menu">
    <div on:click={uploadFile} class="flex-none w-12 hover-effect rounded-lg">
      <Center>
        <IconBtn>
          <FileImportSolid />
        </IconBtn>
      </Center>
    </div>
    <div
      on:click={() => {
        dialogAction = 'file';
        showDialog();
      }}
      class="flex-none w-12 hover-effect rounded-lg"
    >
      <Center>
        <IconBtn width={'1rem'}>
          <FileMedicalSolid />
        </IconBtn>
      </Center>
    </div>
    <div
      on:click={() => {
        dialogAction = 'folder';
        showDialog();
      }}
      class="flex-none w-12 hover-effect rounded-lg"
    >
      <Center>
        <IconBtn>
          <FolderPlusSolid />
        </IconBtn>
      </Center>
    </div>
    <div on:click={() => (itemsListPromise = getFolderContent())} class="ml-auto flex-none w-12 hover-effect rounded-lg">
      <Center>
        <IconBtn>
          <RedoAltSolid />
        </IconBtn>
      </Center>
    </div>
  </div>
  <div id="container" class="px-16 pb-16 overflow-auto">
    {#if itemsListPromise === null}
      <Center>
        <Loader />
      </Center>
    {:else}
      {#await itemsListPromise}
        <Center>
          <Loader />
        </Center>
      {:then itemsList}
        {#each itemsList as item}
          <SystemItemComponent {disk} originPath={workPath} obj={item} />
        {/each}
      {/await}
    {/if}
  </div>
  <OverDialog visible={visibleDialog} on:hide={hideDialog}>
    <InputForm
      placeholder="Item name"
      on:submit={e => {
        if (dialogAction === 'file') createFile(e.detail.value);
        else createFolder(e.detail.value);
      }}
    />
  </OverDialog>
</div>

<style>
  #top-menu {
    border-bottom: 1px solid #4d4d4d;
  }
  #container {
    height: calc(100vh - 8.5rem);
  }
</style>
