<script lang="ts">
  export let pointer: boolean = true;
</script>

<button style={`cursor: ${pointer ? 'pointer' : 'default'};`} class="w-5">
  <slot />
</button>
