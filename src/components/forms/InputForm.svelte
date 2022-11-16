<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let placeholder: string = '';
  let value: string;

  let dispatcher = createEventDispatcher();

  const submit = () => {
    if (value) dispatcher('submit', { value });
  };
</script>

<form on:submit={e => e.preventDefault()} class="p-4 flex flex-col justify-center items-center">
  <input
    class="my-2 w-72 bg-gray-200 appearance-none border-2 border-gray-200 rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-500"
    type="text"
    {placeholder}
    bind:value
  />
  <button
    class="my-2 bg-sky-500 hover:bg-sky-400 focus:shadow-outline focus:outline-none text-white py-2 px-4 rounded-lg"
    on:click={submit}>Submit</button
  >
</form>
