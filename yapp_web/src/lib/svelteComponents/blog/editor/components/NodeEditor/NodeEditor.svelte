<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { slide } from "svelte/transition";
    import YoutubeEditor from "./components/YoutubeEditor.svelte";
    import ImageEditor from "./components/ImageEditor.svelte";

    export let editor: any = undefined;

    let updateTrigger = 0;
    let eventsAttached = false;
    let activeNode = "none";

    function forceUpdate() {
        updateTrigger += 1;
    }

    function checkActiveNode() {
        if (!editor) return;
        
        if (editor.isActive("youtube")) {
            activeNode = "youtube";
        } else if (editor.isActive("imageResize")) {
            activeNode = "imageResize";
        } else {
            activeNode = "none";
        }
    }

    $: if (editor && !eventsAttached) {
        editor.on("selectionUpdate", checkActiveNode);
        editor.on("transaction", checkActiveNode);
        eventsAttached = true;
        checkActiveNode(); 
    }

    onDestroy(() => {
        if(editor) {
            editor.off("selectionUpdate", forceUpdate)
            editor.off("transaction", forceUpdate)
        }
    })

    const show = persistedStore("ui_show_nodeEditor", true)
</script>

<div class="w-full max-w-sm">
    <button 
        on:click={() => ($show = !$show)} 
        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
    >
        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
        </span>
        <h2>Viewer Actions</h2>
    </button>


    {#if $show}
        <div class="w-full flex flex-col gap-2" transition:slide={{ duration: 200 }}>
            {#if editor}
                {#key updateTrigger}
                    {#if activeNode == "youtube"}
                        <YoutubeEditor editor={editor} />
                    {:else if activeNode == "imageResize"}
                        <ImageEditor editor={editor} />
                    {:else}
                        <div class="w-full p-4 text-center">
                            <p class="text-xs text-gray-500">
                                Click on a part of your block in the editor to change its settings here.
                            </p>
                        </div>
                    {/if}
                {/key}
            {:else}
                <p class="text-xs text-gray-400 italic pl-6">Editor not ready...</p>
            {/if}
        </div>
    {/if}
</div>