<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let pass: string;

  let dispatcher = createEventDispatcher();

  const submit = () => {
    dispatcher('submit', { pass });
  };
</script>

<form on:submit={e => e.preventDefault()} class="w-full h-full p-4 flex flex-col">
  <input type="text" placeholder="Disk pass" bind:value={pass} />
  <button on:click={submit}>Open disk</button>
</form>
