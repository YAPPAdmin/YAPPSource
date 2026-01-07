<script lang="ts">
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import { createEventDispatcher } from "svelte";

    export let label: string;
    export let description: string;
    export let value: string;
    
    const dispatch = createEventDispatcher();

    function handleChange(event: Event) {
        dispatch("update", (event.target as HTMLTextAreaElement).value);
    }
</script>

<div class="max-w-sm">
    <label for="input-label" class="block text-sm capitalize font-medium mb-2">{label}</label>
    
    <Tooltip text={description}>
        <textarea 
            class="py-2 px-3 bg-gray-100 sm:py-3 sm:px-4 block w-full  rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" 
            rows="3" 
            placeholder={description}
            bind:value
            on:input={handleChange}
        />
    </Tooltip>
</div>

