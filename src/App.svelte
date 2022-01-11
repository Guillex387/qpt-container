<script lang="ts">
  import Home from './pages/Home.svelte';
  import Tailwind from './Tailwind.svelte';
</script>

<main id="root">
  <Home />
</main>

<style global>
  #root {
    position: absolute;
    width: 100%;
    height: 100%;
    color: #b2b2b2;
    background: #2f3437;
  }

  .icon-hover {
    transition-duration: 300ms;
  }
  .icon-hover:hover {
    background: #ffffff1a;
    color: white;
  }
</style>
