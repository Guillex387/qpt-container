<script lang="ts">
  import Center from './Center.svelte';
  import HddSolid from '../icons/hdd-solid.svelte';
  import IconBtn from './IconBtn.svelte';
  import DropDown from './DropDown.svelte';
  import MenuItem from './MenuItem.svelte';
  import PenSolid from '../icons/pen-solid.svelte';
  import OverDialog from './OverDialog.svelte';
  import InputForm from './forms/InputForm.svelte';
  import TrashAltSolid from '../icons/trash-alt-solid.svelte';
  import { showErrorBox } from '../controllers/dialogs';
  import Error from '../lib/error';
  import { disksData, setDisksData } from '../controllers/disksManager';
  import { loadedDisk, loadedDiskWorkPath, page } from '../globalState';
  import DiskFileSystem from '../lib/disk/diskFileSystem';

  const openDisk = async (pass: string) => {
    hideDialog();
    try {
      let file = disksData()[name];
      let disk = new DiskFileSystem(file, pass, name);
      await disk.readFolder([]);
      loadedDisk.set(disk);
      loadedDiskWorkPath.set([]);
      page.set('disk');
    } catch (error) {
      showErrorBox(error);
    }
  };
  const renameDisk = (newName: string) => {
    hideDialog();
    let disks = disksData();
    let oldInfo = disks[name];
    if (disks[newName]) showErrorBox(new Error(8));
    else {
      delete disks[name];
      disks[newName] = oldInfo;
      setDisksData(disks);
    }
  };
  const deleteDisk = () => {
    hideMenu();
    let disks = disksData();
    delete disks[name];
    setDisksData(disks);
  };

  let visibleMenu = false;
  const showMenu = () => (visibleMenu = true);
  const hideMenu = () => (visibleMenu = false);

  let visibleDialog = false;
  let dialogAction = 'open';
  const showDialog = () => (visibleDialog = true);
  const hideDialog = () => (visibleDialog = false);

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
  <p
    on:dblclick={() => {
      dialogAction = 'open';
      showDialog();
    }}
    class="w-full text-left truncate text-white cursor-pointer select-none"
  >
    {name}
  </p>
  <div class="flex-none w-12 h-full icon-hover rounded-lg">
    <DropDown visible={visibleMenu} on:show={showMenu} on:hide={hideMenu}>
      <MenuItem
        on:click={() => {
          dialogAction = 'rename';
          showDialog();
          hideMenu();
        }}
        text="Rename"
      >
        <Center>
          <IconBtn width={'1rem'}>
            <PenSolid />
          </IconBtn>
        </Center>
      </MenuItem>
      <MenuItem on:click={deleteDisk} text="Delete">
        <Center>
          <IconBtn width={'1rem'}>
            <TrashAltSolid />
          </IconBtn>
        </Center>
      </MenuItem>
    </DropDown>
  </div>
  <OverDialog visible={visibleDialog} on:hide={hideDialog}>
    <InputForm
      placeholder={dialogAction === 'open' ? 'Disk pass' : 'New name'}
      on:submit={e => {
        if (dialogAction === 'open') openDisk(e.detail.value);
        else renameDisk(e.detail.value);
      }}
    />
  </OverDialog>
</div>

<style>
  #container {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }
</style>
