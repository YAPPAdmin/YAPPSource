<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import { createEventDispatcher } from "svelte";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { slide } from "svelte/transition";
    import { BlockRegistry } from "$lib/svelteComponents/homepage/utils/BlocksRegistry";


    const dispatch = createEventDispatcher<{addBlock: BlockNode;}>();

    function addBlock(type: string, config: any) {
        const newContent: Record<string, any> = {};
        const newSettings: Record<string, any> = {};

        if (config.schema?.content) {
            config.schema.content.forEach((field: any) => {
                newContent[field.key] = field.default;
            });
        }

        if (config.schema?.settings) {
            config.schema.settings.forEach((field: any) => {
                newSettings[field.key] = field.default;
            });
        }

        const newBlock = {
            id: uuidv4().replace(/-/g, ""),
            type: type,
            content: newContent,
            settings: newSettings
        };

        dispatch("addBlock", newBlock);
    }

    const show = persistedStore("ui_pe_show_palette", true)

</script>

<div class="w-full max-w-sm">

    <div class="flex">
        <button on:click={() => ($show = !$show)} class="flex flex-row items-center justify-start w-full text-gray-500 hover:text-black font-semibold">
            <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
                <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
            </span>
            <h2>Palette</h2>
        </button>
    </div>

    {#if $show}
        <div class="mt-4 w-full flex flex-col space-y-1" transition:slide={{ duration: 200 }}>
            {#each Object.entries(BlockRegistry) as [type, config]}
                <button on:click={() => addBlock(type, config)} class="flex items-center gap-2 p-2 text-left rounded-lg hover:bg-primary-900 hover:border-primary-500 shadow-lg hover:shadow-xl transition-all">
                    <div>
                        <Iconify iconId={config.icon || "material-symbols-light:widgets-outline-rounded"} />
                    </div>

                    <div class="flex flex-col">
                        <p class="text-primary-500! font-semibold!">{config.name}</p>
                        <p class="text-gray-500! text-sm! text-wrap wrap-break-word">{config.description}</p>
                    </div>

                </button>
            {/each}
        </div>
    {/if}
</div>

