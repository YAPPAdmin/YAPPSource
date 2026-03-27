<script lang="ts">
    import type { BlockNode } from "$lib/svelteComponents/homepage/utils/blocks";
    import { BlockRegistry } from "$lib/svelteComponents/homepage/utils/BlocksRegistry";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { createEventDispatcher } from "svelte";


    export let blocks: BlockNode[] = [];
    export let selectedComponentId: string | null = null;
    export let isEditing: boolean = true;

    const dispatch = createEventDispatcher();

</script>

<div class="flex-1 w-full min-w-0 min-h-100 h-fit flex flex-col ease-in-out overflow-y-auto scroll-p-20 overflow-x-hidden">
    <div class={isEditing ? "h-filt p-2.5 tape rounded-xl" : "h-fit p-2.5 rounded-xl"}>
        <div class="bg-white p-2.5 rounded-xl">

            {#if blocks.length === 0}
                <div class="h-64 flex-1 flex items-center justify-center bg-white text-gray-500 border-2 border-dashed border-gray-500 rounded-xl">
                    Drag and drop a block here to start building.
                </div>
            {/if}

            {#each blocks as block (block.id) }
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    on:click={() => dispatch("selectBlock", block)} 
                    class=
                    "
                    relative w-full min-w-0 transition-all border-2 overflow-hidden
                    {selectedComponentId === block.id ? 'border-primary-500' : 'border-transparent hover:border-gray-300'}
                    " 
                    
                >
                    {#if BlockRegistry[block.type]}
                        <svelte:component 
                            this={BlockRegistry[block.type].component}
                            content={block.content}
                            settings={block.settings}
                        />
                    {:else}
                        <div>
                            <p>Missing component for type: <span>{block.type}</span></p>
                        </div>
                    {/if}

                    {#if selectedComponentId == block.id}
                        <div class="absolute top-2 right-2 z-10">
                            <button 
                                class="p-1 bg-white rounded-full shadow-sm hover:bg-error-light transition-colors"
                                on:click|stopPropagation={(() => dispatch("removeBlock", block))}
                            >
                                <Iconify iconId={"material-symbols-light:delete-outline-rounded"} style={"color: red"} button={true}/>
                            </button>
                        </div>
                    {/if}
                </div>
            {/each}
            
        </div>  
    </div>
</div>