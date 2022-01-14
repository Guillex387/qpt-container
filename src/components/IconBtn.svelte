<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let pointer: boolean = true;
  let dispatch = createEventDispatcher();
  let el: HTMLElement;

  function onClick(ev: MouseEvent) {
    // dispatch('click', {
    //   x: ev.x,
    //   y: ev.y,
    // });
    console.log('Pos:', { x: el.offsetLeft, y: el.offsetTop });
  }
</script>

<button bind:this={el} style={`cursor: ${pointer ? 'pointer' : 'default'};`} class="w-5" on:click={onClick}>
  <slot />
</button>
