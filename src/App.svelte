<script lang="ts">
  import { page } from './globalState';
  import Tailwind from './Tailwind.svelte';
  import Home from './pages/Home.svelte';
  import License from './pages/License.svelte';
  import { fade, fly } from 'svelte/transition';

  let renderPage: string = 'home';

  page.subscribe(value => {
    renderPage = value;
  });
</script>

<main id="root">
  {#if renderPage === 'home'}
    <div in:fly={{ y: -200, duration: 300 }} out:fade={{ duration: 300 }}>
      <Home />
    </div>
  {:else if renderPage === 'license'}
    <div in:fly={{ y: -200, duration: 300 }} out:fade={{ duration: 300 }}>
      <License />
    </div>
  {:else}
    <Home />
  {/if}
</main>

<style global>
  #root {
    position: absolute;
    width: 100%;
    height: 100%;
    color: #b2b2b2;
    background: #2f3437;
  }

  .hover-effect {
    cursor: pointer;
    transition-duration: 300ms;
  }
  .hover-effect:hover {
    background: #ffffff1a;
    color: white;
  }
</style>
