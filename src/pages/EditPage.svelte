<script lang="ts">
  import IconBtn from '../components/utils/IconBtn.svelte';
  import Center from '../components/utils/Center.svelte';
  import ArrowLeftSolid from '../icons/arrow-left-solid.svelte';
  import SaveSolid from '../icons/save-solid.svelte';
  import { onDestroy } from 'svelte';
  import { fileState, page, saveCb } from '../globalState';

  const strToBuffer = (str: string) => Buffer.from(str, 'utf-8');

  let textValue: string = '';

  let fileStateLocal: { name: string; content: Buffer } = { name: 'Default', content: Buffer.alloc(0) };
  let saveCbLocal: (content: Buffer) => void = () => null;

  let unsubscribeFileState = fileState.subscribe(value => {
    fileStateLocal = value;
    textValue = fileStateLocal.content.toString('utf-8');
  });
  let unsubscribeSaveCb = saveCb.subscribe(func => (saveCbLocal = func));

  onDestroy(() => {
    unsubscribeFileState();
    unsubscribeSaveCb();
  });
</script>

<main class="fixed h-full w-full">
  <header class="flex items-center h-12 rounded-b-lg">
    <div on:click={() => page.set('disk')} class="flex-none w-12 h-full hover-effect rounded-b-lg">
      <Center>
        <IconBtn>
          <ArrowLeftSolid />
        </IconBtn>
      </Center>
    </div>
    <p class="w-full text-center">{fileStateLocal.name}</p>
    <div on:click={() => saveCbLocal(strToBuffer(textValue))} class="flex-none w-12 h-full hover-effect rounded-b-lg">
      <Center>
        <IconBtn>
          <SaveSolid />
        </IconBtn>
      </Center>
    </div>
  </header>
  <article class="w-full bg-white text-black">
    <textarea bind:value={textValue} class="w-full h-full m-0 p-2" />
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
  textarea {
    border: none;
    resize: none;
    outline: none;
    font-family: monospace;
  }
</style>
