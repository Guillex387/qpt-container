<script lang="ts">
  import { onDestroy } from 'svelte';
  import DiskComponent from './DiskComponent.svelte';
  import { disksData, DisksData, reloadDisksData, setDisksData } from '../controllers/disksManager';
  import { disks } from '../globalState';
  import Center from './utils/Center.svelte';
  import IconBtn from './utils/IconBtn.svelte';
  import FileImportSolid from '../icons/file-import-solid.svelte';
  import PlusCircleSolid from '../icons/plus-circle-solid.svelte';
  import RedoAltSolid from '../icons/redo-alt-solid.svelte';
  import OverDialog from './OverDialog.svelte';
  import CreateDisk from './forms/CreateDisk.svelte';
  import { showErrorBox, showOpenBox, showSaveBox } from '../controllers/dialogs';
  import { createDisk } from '../controllers/diskController';
  import InputForm from './forms/InputForm.svelte';
  import Error from '../lib/error';
  import Loader from './utils/Loader.svelte';

  let disksState: DisksData | null = null;
  $: diskList = disksState && Object.keys(disksState);

  let unsubscribe = disks.subscribe(value => (disksState = value));

  let visibleDialog = false;
  let dialogAction = 'create';
  const showDialog = () => (visibleDialog = true);
  const hideDialog = () => (visibleDialog = false);

  const createDiskEvent = ({ name, pass }) => {
    dialogAction = 'create';
    let file = showSaveBox([
      {
        name: 'Disk files',
        extensions: ['dsk'],
      },
    ]);
    createDisk(name, pass, file);
  };

  let selectedDisk: string;

  const importDisk = () => {
    dialogAction = 'import';
    let selection = showOpenBox(false, [{ name: 'Disk files', extensions: ['dsk'] }]);
    if (selection) {
      selectedDisk = selection[0];
      showDialog();
    }
  };

  const importEvent = (name: string) => {
    let disks = disksData();
    if (disks[name]) {
      hideDialog();
      showErrorBox(new Error(8));
      return;
    }
    disks[name] = selectedDisk;
    setDisksData(disks);
    hideDialog();
  };

  onDestroy(unsubscribe);
</script>

<div class="w-full h-full">
  <div class="flex h-12" id="top-menu">
    <div on:click={importDisk} class="flex-none w-12 hover-effect rounded-lg">
      <Center>
        <IconBtn>
          <FileImportSolid />
        </IconBtn>
      </Center>
    </div>
    <div
      on:click={() => {
        dialogAction = 'create';
        showDialog();
      }}
      class="flex-none w-12 hover-effect rounded-lg"
    >
      <Center>
        <IconBtn>
          <PlusCircleSolid />
        </IconBtn>
      </Center>
    </div>
    <div on:click={reloadDisksData} class="ml-auto flex-none w-12 hover-effect rounded-lg">
      <Center>
        <IconBtn>
          <RedoAltSolid />
        </IconBtn>
      </Center>
    </div>
  </div>
  <div id="container" class="px-16 pb-16 overflow-auto">
    {#if disksState === null}
      <Center>
        <Loader />
      </Center>
    {:else}
      {#each diskList as diskName}
        <DiskComponent name={diskName} />
      {/each}
    {/if}
  </div>
  <OverDialog visible={visibleDialog} on:hide={hideDialog}>
    {#if dialogAction === 'import'}
      <InputForm placeholder="Write a name for the disk..." on:submit={e => importEvent(e.detail.value)} />
    {:else}
      <CreateDisk on:submit={e => createDiskEvent(e.detail)} />
    {/if}
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
