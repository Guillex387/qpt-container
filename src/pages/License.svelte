<script lang="ts">
  import IconBtn from '../components/utils/IconBtn.svelte';
  import Center from '../components/utils/Center.svelte';
  import BarsSolid from '../icons/bars-solid.svelte';
  import SideBar from '../components/SideBar.svelte';

  let visibleSideBar = false;
  function showSideBar() {
    visibleSideBar = true;
  }
  function hideSideBar() {
    visibleSideBar = false;
  }
</script>

<main class="fixed h-full w-full">
  <header class="flex items-center h-12 rounded-b-lg">
    <div on:click={showSideBar} class="flex-none w-12 h-full hover-effect rounded-b-lg">
      <Center>
        <IconBtn>
          <BarsSolid />
        </IconBtn>
      </Center>
    </div>
    <p class="w-full text-center">License</p>
    <div class="flex-none w-12 h-full" />
  </header>
  <article class="flex justify-center px-20 pt-10">
    <div id="content">
      <h1 class="text-xl text-center font-bold p-4">GNU General Public License v3.0</h1>
      <p>
        Qpt-container is licensed under the <a
          class="text-sky-500 hover:underline"
          href="https://github.com/Guillex387/qpt-container/blob/master/COPYING">GPL-3.0 License</a
        >. Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works
        and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices
        must be preserved. Contributors provide an express grant of patent rights.
      </p>
      <p class="text-center mt-5 opacity-50 text-sm">Guillex387 © 2022</p>
    </div>
  </article>
  <SideBar on:hide={hideSideBar} visible={visibleSideBar} />
</main>

<style>
  header {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }

  #content {
    width: 40rem;
  }
</style>
