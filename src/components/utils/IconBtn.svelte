<script lang="ts">
  export let pointer: boolean = true;
  export let width: string = '1.25rem';

  $: style = `cursor: ${pointer ? 'pointer' : 'default'}; width: ${width};`;
</script>

<button {style}>
  <slot />
</button>
