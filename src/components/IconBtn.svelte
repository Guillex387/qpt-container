<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let pointer: boolean = true;
  let dispatch = createEventDispatcher();

  function onClick(ev: MouseEvent) {
    dispatch('click', {
      x: ev.x,
      y: ev.y,
    });
  }
</script>

<button
  style={`cursor: ${pointer ? 'pointer' : 'default'};`}
  class="w-5"
  on:click={onClick}
>
  <slot />
</button>
