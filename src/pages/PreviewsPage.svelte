<script lang="ts">
  import IconBtn from '../components/utils/IconBtn.svelte';
  import Center from '../components/utils/Center.svelte';
  import ArrowLeftSolid from '../icons/arrow-left-solid.svelte';
  import { filePreview, page } from '../globalState';
  import { onDestroy } from 'svelte';
  import Pdf from '../components/renders/Pdf.svelte';
  import Image from '../components/renders/Image.svelte';
  import Video from '../components/renders/Video.svelte';
  import Default from '../components/renders/Default.svelte';
  import Loader from '../components/utils/Loader.svelte';
  import Audio from '../components/renders/Audio.svelte';
  import Html from '../components/renders/Html.svelte';
  import Obj from '../components/renders/obj.svelte';
  import { lookup } from 'mime-types';

  let filePreviewLocal: { name: string; content: Buffer } = { name: 'Default', content: Buffer.alloc(0) };
  let previewUrl: string = '';
  let mimeType = lookup(filePreviewLocal.name);
  let baseType = mimeType && mimeType.split('/').shift();

  const getUrl = (buf: Buffer) => {
    let blob = new Blob([Uint8Array.from(buf)]);
    return URL.createObjectURL(blob);
  };

  const unsubscribeFile = filePreview.subscribe(value => {
    filePreviewLocal = value;
    previewUrl = getUrl(value.content);
  });

  onDestroy(() => {
    unsubscribeFile();
    previewUrl && URL.revokeObjectURL(previewUrl);
  });
</script>

<main class="fixed h-full w-full">
  <header class="flex items-center h-12 rounded-b-lg">
    <div on:click={() => page.set('disk')} class="flex-none w-12 h-full hover-effect rounded-lg">
      <Center>
        <IconBtn>
          <ArrowLeftSolid />
        </IconBtn>
      </Center>
    </div>
    <p class="w-full text-center truncate">{filePreviewLocal.name}</p>
    <div class="flex-none w-12 h-full" />
  </header>
  <article class="w-full">
    {#if previewUrl}
      {#if baseType === 'image'}
        <Image src={previewUrl} />
      {:else if baseType === 'video'}
        <Video mimeType={mimeType || ''} src={previewUrl} />
      {:else if baseType === 'audio'}
        <Audio mimeType={mimeType || ''} src={previewUrl} />
      {:else if mimeType === 'application/pdf'}
        <Pdf src={previewUrl} />
      {:else if mimeType === 'text/html'}
        <Html src={previewUrl} />
      {:else if mimeType === 'model/obj'}
        <Obj src={previewUrl} />
      {:else}
        <Default src={previewUrl} />
      {/if}
    {:else}
      <Center>
        <Loader />
      </Center>
    {/if}
  </article>
</main>

<style>
  header {
    background: #373c3f;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }

  article {
    height: calc(100vh - 3rem);
  }
</style>
