<script lang="ts">
  import { page } from './globalState';
  import Tailwind from './Tailwind.svelte';
  import Home from './pages/Home.svelte';
  import License from './pages/License.svelte';
  import DiskPage from './pages/DiskPage.svelte';
  import Settings from './pages/Settings.svelte';
  import PreviewsPage from './pages/PreviewsPage.svelte';
  import PageTransition from './components/utils/PageTransition.svelte';

  let renderPage: string = 'home';

  page.subscribe(value => {
    renderPage = value;
  });
</script>

<main id="root">
  {#if renderPage === 'home'}
    <PageTransition>
      <Home />
    </PageTransition>
  {:else if renderPage === 'disk'}
    <PageTransition>
      <DiskPage />
    </PageTransition>
  {:else if renderPage === 'preview'}
    <PageTransition>
      <PreviewsPage />
    </PageTransition>
  {:else if renderPage === 'settings'}
    <PageTransition>
      <Settings />
    </PageTransition>
  {:else if renderPage === 'license'}
    <PageTransition>
      <License />
    </PageTransition>
  {:else}
    <PageTransition>
      <Home />
    </PageTransition>
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

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 0.5rem;
    background-color: #4d4d4d;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #b2b2b2;
  }
</style>
