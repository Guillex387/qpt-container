<script lang="ts">
  import Center from '../utils/Center.svelte';

  export let src: string;
  export let mimeType: string;
</script>

<div class="w-full h-full">
  <Center>
    <audio controls controlslist="nodownload" class="outline-none">
      <source {src} type={mimeType} />
    </audio>
  </Center>
</div>
