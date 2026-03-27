<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { newVersionStack } from "$lib/utils/pageEditor/NewVersionStore/newVersionStore";
    import type { PageLayout } from "$lib/utils/pageEditor/PageLayout";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";
    import VersionCard from "$lib/svelteComponents/homepage/editor/editor/components/VersionCard.svelte"

    export let pageLayout: PageLayout | undefined;
    export let selectedVersionId: string | undefined;

    const dispatch = createEventDispatcher();

    const show = persistedStore("ui_pe_show_version_management", true)

    function handleLoadVersion(versionId: string) {
        dispatch("loadVersion", versionId)
    }

</script>

<div class="w-full max-w-sm">

    <div class="flex">
        <button on:click={() => ($show = !$show)} class="flex flex-row items-center justify-start w-full text-gray-700 hover:text-black font-semibold">
            <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
                <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
            </span>
            <h2>All Versions</h2>
        </button>

        <button
            class:opacity-0={!$show}
            class:opacity-100={$show}
            class="transform transition-transform duration-300"
            class:-rotate-90={!$show} 
            on:click={() => newVersionStack.open({ 
                pageLayout: pageLayout, 
                baseVersionId: selectedVersionId
            })}
        >
            <Iconify iconId={"material-symbols-light:add-rounded"} button={true}/>
        </button>
    </div>

    {#if $show}
        <div class="mt-4 w-full flex flex-col space-y-1" transition:slide={{ duration: 200 }}>
            {#if !pageLayout?.versions?.length}
                <p>No Versions</p>
            {:else}
                {#each pageLayout?.versions as version}
                    <button 
                        class="w-full" 
                        on:click={() => handleLoadVersion(version.id)}
                    >
                        <VersionCard version={version} selectedVersionId={selectedVersionId}/>
                    </button>
                {/each}
            {/if}
        </div>
    {/if}
</div>