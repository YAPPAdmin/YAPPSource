<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import Iconify from "../iconify/Iconify.svelte";

    export let options: string[] = [];
    export let placeholder: string = "Select options";
    export let selected: string[] = [];
    export let maxSelected: number | null = null;
    export let title: string = "";

    const dispatch = createEventDispatcher();

    let isOpen: boolean = false;
    let searchQuery: string = "";
    let rootElement: HTMLElement;

    function toggleOption(option: string) {
        if(selected.includes(option)) {
            selected = selected.filter((s) => s !== option);
        } else {
            // Block selecting more then the maximum allowed options
            if (maxSelected !== null && selected.length >= maxSelected) {
                selected.shift()
            };
            selected = [...selected, option]
        }
        // Reasignment in this scope triggers {#if isSelected...} blocks
        selected = [...selected];
        dispatch("change", selected);
    }

    function toggleDropdown() {
        isOpen = !isOpen;
    }

    $: filteredOptions = options.filter((opt) => 
        opt.toLowerCase().includes(searchQuery.toLocaleLowerCase())
    )

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as Node;
        // Delay closing to allow toggleOption to complete
        setTimeout(() => {
            if (!rootElement?.contains(target)) {
            isOpen = false;
            }
        });
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onDestroy(() => {
        document.removeEventListener('click', handleClickOutside);
    });

</script>


<!-- https://preline.co/docs/advanced-select.html -->
<div class="relative w-full" bind:this={rootElement}>
    
    <!-- Toggle Button -->
    <button
        type="button"
        class="relative min-h-13 py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:ring-2 focus:ring-blue-500"
        on:click={toggleDropdown}
    >
        {#if selected.length === 0}
            <span class="text-gray-400 my-auto">{placeholder}</span>
        {:else}
            <!-- Selected Display -->
            <div class="flex flex-wrap gap-1">
                {#each selected as item}
                    <div class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        {item}
                    </div>
                {/each}
            </div>
        {/if}

        <div class="transition-transform duration-300 ease-in-out transform absolute top-1/2 end-3 -translate-y-1/2 pointer-events-none" class:rotate-180={isOpen}>
            <Iconify iconId={"material-symbols-light:arrow-drop-down-circle-outline-rounded"} inline={true}/>
        </div>
    </button>

    <!-- Dropdown -->
    {#if isOpen}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="absolute z-50 mt-2 w-full max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg p-1 space-y-0.5 shadow-lg">
            
            <!-- Search Bar -->
            <div class="bg-white p-2 -mx-1 sticky top-0 z-10">
                <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search..."
                class="block w-full sm:text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2 px-3"
                />
            </div>

            <!-- Options -->
            {#each filteredOptions as option}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="flex h-8 justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-lg cursor-pointer"
                    on:click={() => toggleOption(option)}
                >

                    <span class={selected.includes(option) ? 'font-semibold' : ''}>
                        {option}
                    </span>

                    {#if selected.includes(option)}
                        <Iconify iconId={"material-symbols-light:check-rounded"} inline={true}/>
                    {/if}
                    
                </div>
            {/each}

        </div>
    {/if}
</div>