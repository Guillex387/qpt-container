<script lang="ts">
  import { fly, fade } from 'svelte/transition';
</script>

<div in:fly={{ y: -200, duration: 300 }} out:fade={{ duration: 300 }}>
  <slot />
</div>
