<script lang="ts">
  export let src: string;
</script>

<div class="w-full h-full">
  <embed type="application/pdf" class="w-full h-full" src={`${src}#toolbar=0`} />
</div>
