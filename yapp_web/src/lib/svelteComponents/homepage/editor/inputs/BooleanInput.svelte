<script lang="ts">
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import { createEventDispatcher } from "svelte";


    export let label: string;
    export let description: string;
    export let value: string;
    
    const dispatch = createEventDispatcher();

    function toggle() {
        dispatch("update", !value);
    }
</script>

<div class="max-w-sm">
    <label for="input-label" class="block text-sm capitalize font-medium mb-2">{label}</label>
    
    <Tooltip text={description}>
        <div class="flex items-center gap-x-3">
            <label for="hs-basic-with-description-checked" class="relative inline-block w-11 h-6 cursor-pointer">
                
                <input 
                    type="checkbox" 
                    id="hs-basic-with-description-checked" 
                    class="peer sr-only" 
                    checked={Boolean(value)}
                    on:change={toggle}
                >
                
                <span class="absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:pointer-events-none"></span>
                <span class="absolute top-1/2 start-0.5 -translate-y-1/2 size-5 bg-white rounded-full shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full"></span>
            </label>

            <label for="hs-basic-with-description-checked" class="text-sm text-gray-500 ">{description}</label>
        </div>
    </Tooltip>
</div>

