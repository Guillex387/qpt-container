<script lang="ts">
  import IconBtn from '../components/IconBtn.svelte';
  import Center from '../components/Center.svelte';
  import EllipsisHSolid from '../icons/ellipsis-h-solid.svelte';
  import BarsSolid from '../icons/bars-solid.svelte';
  import FileImportSolid from '../icons/file-import-solid.svelte';
  import PlusCircleSolid from '../icons/plus-circle-solid.svelte';
  import RedoAltSolid from '../icons/redo-alt-solid.svelte';
  import DiskList from '../components/DiskList.svelte';
</script>

<main>
  <header class="flex items-center h-12 rounded-b-lg">
    <div class="flex-none w-12 h-full icon-hover rounded-b-lg">
      <Center>
        <IconBtn>
          <BarsSolid />
        </IconBtn>
      </Center>
    </div>
    <p class="w-full text-center">Your disks</p>
    <div class="flex-none w-12 h-full icon-hover rounded-b-lg">
      <Center>
        <IconBtn>
          <EllipsisHSolid />
        </IconBtn>
      </Center>
    </div>
  </header>
  <article class="flex justify-center px-20 pt-10">
    <div class="w-9/12" id="content">
      <div class="flex h-12" id="top-menu">
        <div class="flex-none w-12 icon-hover rounded-lg">
          <Center>
            <IconBtn>
              <FileImportSolid />
            </IconBtn>
          </Center>
        </div>
        <div class="flex-none w-12 icon-hover rounded-lg">
          <Center>
            <IconBtn>
              <PlusCircleSolid />
            </IconBtn>
          </Center>
        </div>
        <div class="ml-auto flex-none w-12 icon-hover rounded-lg">
          <Center>
            <IconBtn>
              <RedoAltSolid />
            </IconBtn>
          </Center>
        </div>
      </div>
      <hr />
      <DiskList disks={[]} />
    </div>
  </article>
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
