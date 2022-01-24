<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let name: string;
  let pass: string;

  let dispatcher = createEventDispatcher();

  const submit = () => {
    if (name && pass) dispatcher('submit', { name, pass });
  };
</script>

<form on:submit={e => e.preventDefault()} class="w-full h-full p-4 flex flex-col items-center">
  <input
    class="my-2 w-72 bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-500"
    type="text"
    placeholder="Disk name"
    bind:value={name}
  />
  <input
    class="my-2 w-72 bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-500"
    type="text"
    placeholder="Disk pass"
    bind:value={pass}
  />
  <button
    class="my-2 bg-sky-500 hover:bg-sky-400 focus:shadow-outline focus:outline-none text-white py-2 px-4 rounded-lg"
    on:click={submit}>Create disk</button
  >
</form>
