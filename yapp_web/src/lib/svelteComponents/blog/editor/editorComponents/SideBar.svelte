<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";

    export let isOpen: boolean = true;
    export let position: "left" | "right" = "left";
    export let barName: string = "Bar"

</script>

<div
    class="
        shrink-0 flex flex-col h-full transition-[width] duration-300 ease-in-out
        overflow-y-auto overflow-x-hidden custom-scrollbar
        {isOpen ? 'w-1/6' : 'w-10'}
    "
>
    <div class="">
        <button 
            on:click={() => (isOpen = !isOpen)}
            class="flex flex-row items-center justify-start w-full"    
        >
            <span class="transform transition-transform duration-300" class:-rotate-90={!isOpen}>
                <Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} />
            </span>
            <h1 class="text-2xl! my-2 whitespace-nowrap transition-opacity duration-200" class:opacity-0={!isOpen} class:opacity-100={isOpen}>
                {barName}
            </h1>
        </button>
    </div>

    {#if isOpen}
        <div class="flex flex-col whitespace-nowrap min-h-min h-full w-full gap-2 p-2 mb-10">
            
            <slot />

        </div>
    {/if}
</div>