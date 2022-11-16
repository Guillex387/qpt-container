<script lang="ts">
  import Center from '../utils/Center.svelte';

  export let src: string;
</script>

<div class="w-full h-full">
  <!-- svelte-ignore a11y-img-redundant-alt -->
  <Center>
    <img class="max-w-full max-h-full" {src} alt="Image preview" />
  </Center>
</div>
