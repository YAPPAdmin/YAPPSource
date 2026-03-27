<script lang="ts">
    import { BlockRegistry } from "$lib/svelteComponents/homepage/utils/BlocksRegistry";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { createEventDispatcher } from "svelte";
    import TextInput from "../../inputs/TextInput.svelte";
    import ImageInput from "../../inputs/ImageInput.svelte"; 
  import ArrayInput from "../../inputs/ArrayInput.svelte";

    export let selectedBlock: any | null = null; 
    const dispatch = createEventDispatcher();

    $: config = selectedBlock ? BlockRegistry[selectedBlock.type] : null;
    $: schema = config?.schema;

    $: if (selectedBlock) {
        dispatch("update"); 
    }
</script>

<div class="h-fit overflow-y-auto p-4 flex flex-col gap-6">
    {#if selectedBlock && schema}
        
        <div>
            <h2 class="text-lg font-bold!">{config?.name || "Unknown Component"}</h2>
            <p class="text-gray-500! text-sm! text-wrap wrap-break-word">{config?.description || ""}</p>
        </div>

        {#if schema.content && schema.content.length > 0}
            <div class="flex flex-col gap-3">
                <h3 class="text-sm! font-bold text-gray-400 uppercase tracking-wider border-b pb-1">Content</h3>
                
                {#each schema.content as field}
                    <div class="flex flex-col gap-1">

                        
                        {#if field.type === "text"} <!-- Text -->
                            <TextInput 
                                label={field.label}
                                description={field.description}
                                placeholder={field.placeholder}
                                bind:value={selectedBlock.content[field.key]} 
                                />

                        {:else if field.type == "image"} <!-- Images -->
                            <ImageInput 
                                label={field.label}
                                description={field.description}
                                bind:value={selectedBlock.settings[field.key]} 
                            />

                            
                        {:else if field.type === "array"} <!-- Arrays -->
                            <ArrayInput 
                                label={field.label}
                                description={field.description}
                                itemSchema={field.itemSchema}
                                bind:value={selectedBlock.content[field.key]} 
                        />

                        {:else if field.type === "boolean"} <!-- Boolean -->
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" bind:checked={selectedBlock.content[field.key]} class="rounded text-primary-600" />
                                <span class="text-sm text-gray-600">Enable</span>
                            </label>
                        {/if}


                        {#if field.description}
                            <p class="text-xs text-gray-500 mt-1">{field.description}</p>
                        {/if}
                    </div>

                    <hr class="my-1! border-gray-200! rounded"/>
                {/each}
            </div>
        {/if}

        {#if schema.settings && schema.settings.length > 0}
            <div class="flex flex-col gap-3">
                <h3 class="text-sm! font-bold text-gray-400 uppercase tracking-wider border-b pb-1">Design & Settings</h3>
                
                {#each schema.settings as field}
                    <div class="flex flex-col gap-1">

                        
                        {#if field.type === "text"} <!-- Text -->
                            <TextInput 
                                label={field.label}
                                description={field.description}
                                placeholder={field.placeholder}
                                bind:value={selectedBlock.content[field.key]} 
                                />

                        {:else if field.type == "image"} <!-- Images -->
                            <ImageInput 
                                label={field.label}
                                description={field.description}
                                bind:value={selectedBlock.settings[field.key]} 
                            />

                        {:else if field.type === "boolean"} <!-- Boolean -->
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" bind:checked={selectedBlock.content[field.key]} class="rounded text-primary-600" />
                                <span class="text-sm text-gray-600">Enable</span>
                            </label>
                        {/if}

                        {#if field.description}
                            <p class="text-xs text-gray-500 mt-1">{field.description}</p>
                        {/if}
                    </div>

                    <hr class="my-1! border-gray-200! rounded"/>
                {/each}
            </div>
        {/if}

    {:else}
        <div class="w-full min-w-0 flex flex-col items-center justify-center h-30 text-center text-gray-500! gap-2  px-4">
            <Iconify iconId="material-symbols-light:touch-app-outline-rounded" />
            <p class="text-sm! text-wrap wrap-break-word">Select a block on the canvas to edit its properties.</p>
        </div>
    {/if}
</div>