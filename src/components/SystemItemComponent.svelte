<script lang="ts">
  import Center from './utils/Center.svelte';
  import FileSolid from '../icons/file-solid.svelte';
  import FolderSolid from '../icons/folder-solid.svelte';
  import IconBtn from './utils/IconBtn.svelte';
  import DropDown from './overlays/DropDown.svelte';
  import MenuItem from './MenuItem.svelte';
  import DiskFileSystem, { File } from '../lib/disk/diskFileSystem';
  import { fileState, loadedDiskWorkPath, page, saveCb } from '../globalState';
  import PenSolid from '../icons/pen-solid.svelte';
  import TrashAltSolid from '../icons/trash-alt-solid.svelte';
  import EditSolid from '../icons/edit-solid.svelte';
  import ExternalLinkAltSolid from '../icons/external-link-alt-solid.svelte';
  import { reloadDisk } from '../controllers/diskController';
  import { showErrorBox, showSaveBox } from '../controllers/dialogs';
  import * as path from 'path';
  import * as fs from 'fs';
  import OverDialog from './overlays/OverDialog.svelte';
  import InputForm from './forms/InputForm.svelte';

  let visibleMenu = false;
  const showMenu = () => (visibleMenu = true);
  const hideMenu = () => (visibleMenu = false);

  export let obj: File;
  export let disk: DiskFileSystem;
  export let originPath: string[];

  let visibleDialog = false;
  const showDialog = () => (visibleDialog = true);
  const hideDialog = () => (visibleDialog = false);

  const openItem = async () => {
    if (obj.metadata.type === 'folder') {
      loadedDiskWorkPath.update(path => [...path, obj.metadata.name]);
    } else {
      try {
        let content = disk.readFile([...originPath, obj.metadata.name]);
        fileState.set({ name: obj.metadata.name, content });
        page.set('preview');
      } catch (error) {
        showErrorBox(error);
      }
    }
  };

  const editItem = () => {
    try {
      let content = disk.readFile([...originPath, obj.metadata.name]);
      fileState.set({ name: obj.metadata.name, content });
      saveCb.set(content => {
        try {
          disk.writeFile([...originPath, obj.metadata.name], content);
        } catch (error) {
          showErrorBox(error);
        }
      });
      page.set('edit');
    } catch (error) {
      showErrorBox(error);
    }
  };

  const renameItem = async (newName: string) => {
    try {
      disk.renameFile([...originPath, obj.metadata.name], newName);
    } catch (error) {
      showErrorBox(error);
    }
    await reloadDisk();
  };

  const deleteItem = async () => {
    try {
      if (obj.metadata.name === 'file') disk.removeFile([...originPath, obj.metadata.name]);
      else disk.removeFile([...originPath, obj.metadata.name]);
    } catch (error) {
      showErrorBox(error);
    }
    await reloadDisk();
  };

  const exportItem = async () => {
    try {
      let ext = path.extname(obj.metadata.name).substring(1);
      let selectedFile = showSaveBox([
        { name: 'Original extension', extensions: [ext] },
        { name: 'All files', extensions: ['*'] },
      ]);
      let content = await disk.readFile([...originPath, obj.metadata.name]);
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
        {#if obj.metadata.type === 'file'}
          <FileSolid />
        {:else}
          <FolderSolid />
        {/if}
      </IconBtn>
    </Center>
  </div>
  <p on:dblclick={openItem} class="w-full text-left truncate text-white cursor-pointer select-none">{obj.metadata.name}</p>
  <div class="flex-none w-12 h-full icon-hover rounded-lg">
    <DropDown visible={visibleMenu} on:show={showMenu} on:hide={hideMenu}>
      {#if obj.metadata.type === 'folder'}
        <MenuItem
          on:click={() => {
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
        <MenuItem on:click={deleteItem} text="Delete">
          <Center>
            <IconBtn width={'1rem'}>
              <TrashAltSolid />
            </IconBtn>
          </Center>
        </MenuItem>
      {:else}
        <MenuItem
          on:click={() => {
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
        <MenuItem on:click={editItem} text="Edit">
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
  <OverDialog visible={visibleDialog} on:hide={hideDialog}>
    <InputForm placeholder="New item name" on:submit={e => renameItem(e.detail.value)} />
  </OverDialog>
</div>

<style>
  #container {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }
</style>
