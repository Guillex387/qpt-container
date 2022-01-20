<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let dispatcher = createEventDispatcher();

  export let text: string;
</script>

<li on:click={() => dispatcher('click')} class="flex items-center h-12 rounded-lg hover-effect px-4">
  <p class="w-full text-left whitespace-nowrap">{text}</p>
  <div class="flex-none w-12 h-full">
    <slot />
  </div>
</li>
