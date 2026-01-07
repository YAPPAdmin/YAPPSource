<script lang="ts">
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import { createEventDispatcher } from "svelte";

	export let label: string;
	export let description: string = "";
	export let value: string | number | null = null;
	export let options: (string | number)[] = [];
	export let path: (string | number)[] = [];
    
    const dispatch = createEventDispatcher();

    function handleChange(event: Event) {
        dispatch("update", (event.target as HTMLTextAreaElement).value);
    }
</script>

<div class="max-w-sm">
    <label for="input-label" class="block text-sm capitalize font-medium mb-2">{label}</label>

    <Tooltip text={description}>
        <select 
            id="hs-select-label" 
            class="py-3 px-4 pe-9 block w-full capitalize border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
            on:change={handleChange}
        >
            {#each options as option }
                <option value={option}>{option}</option>
            {/each}
        </select>
    </Tooltip>
</div>