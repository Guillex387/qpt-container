<script lang="ts">
  import Center from './Center.svelte';
  import FileSolid from '../icons/file-solid.svelte';
  import FolderSolid from '../icons/folder-solid.svelte';
  import IconBtn from './IconBtn.svelte';
  import DropDown from './DropDown.svelte';
  import MenuItem from './MenuItem.svelte';
  import DiskFileSystem, { FileNodeI, FolderNodeI } from '../lib/disk/diskFileSystem';
  import { loadedDiskWorkPath } from '../globalState';
  import PenSolid from '../icons/pen-solid.svelte';
  import TrashAltSolid from '../icons/trash-alt-solid.svelte';
  import EditSolid from '../icons/edit-solid.svelte';
  import ExternalLinkAltSolid from '../icons/external-link-alt-solid.svelte';
  import { reloadDisk } from '../controllers/diskController';
  import { showErrorBox, showSaveBox } from '../controllers/dialogs';
  import * as path from 'path';
  import * as fs from 'fs';

  let visibleMenu = false;
  const showMenu = () => (visibleMenu = true);
  const hideMenu = () => (visibleMenu = false);

  export let obj: FileNodeI | FolderNodeI;
  export let disk: DiskFileSystem;
  export let originPath: string[];

  const openItem = () => {
    if (obj.type === 'folder') {
      loadedDiskWorkPath.update(path => [...path, obj.name]);
    } else {
      // TODO: open a file preview
      console.log('Opened file preview:', obj.name);
    }
  };

  const renameItem = async (newName: string) => {
    try {
      await disk.renameElement([...originPath, obj.name], obj.type, newName);
    } catch (error) {
      showErrorBox(error);
    }
    await reloadDisk();
  };

  const deleteItem = async () => {
    try {
      if (obj.type === 'file') await disk.removeFile([...originPath, obj.name]);
      else await disk.removeFolder([...originPath, obj.name]);
    } catch (error) {
      showErrorBox(error);
    }
    await reloadDisk();
  };

  const editItem = () => {
    // TODO: open the edit page
  };

  const exportItem = async () => {
    try {
      let ext = path.extname(obj.name).substring(1);
      let selectedFile = showSaveBox([
        { name: 'Original extension', extensions: [ext] },
        { name: 'All files', extensions: ['*'] },
      ]);
      let content = await disk.readFile([...originPath, obj.name]);
      fs.writeFileSync(selectedFile, content);
    } catch (error) {
      showErrorBox(error);
    }
  };
</script>

<div class="m-5 flex items-center h-12 rounded-lg" id="container">
  <div class="flex-none w-12 h-full">
    <Center>
      <IconBtn pointer={false}>
        {#if obj.type === 'file'}
          <FileSolid />
        {:else}
          <FolderSolid />
        {/if}
      </IconBtn>
    </Center>
  </div>
  <p on:dblclick={openItem} class="w-full text-left truncate text-white cursor-pointer select-none">{obj.name}</p>
  <div class="flex-none w-12 h-full icon-hover rounded-lg">
    <DropDown visible={visibleMenu} on:show={showMenu} on:hide={hideMenu}>
      {#if obj.type === 'folder'}
        <MenuItem text="Rename">
          <Center>
            <IconBtn width={'1rem'}>
              <PenSolid />
            </IconBtn>
          </Center>
        </MenuItem>
        <MenuItem on:click={deleteItem} text="Delete">
          <Center>
            <IconBtn width={'1rem'}>
              <TrashAltSolid />
            </IconBtn>
          </Center>
        </MenuItem>
      {:else}
        <MenuItem text="Rename">
          <Center>
            <IconBtn width={'1rem'}>
              <PenSolid />
            </IconBtn>
          </Center>
        </MenuItem>
        <MenuItem text="Edit">
          <Center>
            <IconBtn width={'1rem'}>
              <EditSolid />
            </IconBtn>
          </Center>
        </MenuItem>
        <MenuItem on:click={exportItem} text="Export">
          <Center>
            <IconBtn width={'1rem'}>
              <ExternalLinkAltSolid />
            </IconBtn>
          </Center>
        </MenuItem>
        <MenuItem on:click={deleteItem} text="Delete">
          <Center>
            <IconBtn width={'1rem'}>
              <TrashAltSolid />
            </IconBtn>
          </Center>
        </MenuItem>
      {/if}
    </DropDown>
  </div>
  <!-- TODO: put here the dialog for rename items -->
</div>

<style>
  #container {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }
</style>
