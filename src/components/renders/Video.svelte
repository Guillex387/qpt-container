<script lang="ts">
  import Center from '../utils/Center.svelte';

  export let src: string;
  export let mimeType: string;
</script>

<div class="w-full h-full">
  <Center>
    <video controls controlslist="nodownload" class="max-w-full max-h-full outline-none">
      <source {src} type={mimeType} />
      <track kind="captions" />
    </video>
  </Center>
</div>
