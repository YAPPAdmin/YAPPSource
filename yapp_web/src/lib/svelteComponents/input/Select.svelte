<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let options: string[] = [];
    export let lable: string = "";
    export let name: string = "select";
    export let id: string = "select"

    export let value: string = "";
    export let noneOption: string = "";

    const dispatch = createEventDispatcher();

    // Pass on on:input event
      function handleInput(event: Event) {
        dispatch('input', event);
    }

</script>

<!-- https://preline.co/docs/select.html -->
<div class="">
    <select 
        {name} {id}
        bind:value on:change 
        on:input={handleInput}
    >

        {#if noneOption}
            <option value={undefined}>{noneOption}</option>
        {/if}

        {#each options as option}
            <option>{option}</option>
        {/each}
    </select>
<!-- 
    {#if lable}
        <label 
            class="absolute top-0 start-0 p-4 h-full truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none
            peer-focus:text-xs
            peer-focus:-translate-y-1.5
            peer-focus:text-gray-500 
            peer-not-placeholder-shown:text-xs
            peer-not-placeholder-shown:-translate-y-1.5
            peer-not-placeholder-shown:text-gray-500"
        >
            {lable}
        </label>
    {/if} -->
</div>
