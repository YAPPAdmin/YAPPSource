<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import type { BlogPost } from "$lib/utils/blog/blog";
    import type { BlogPostVersion } from "$lib/utils/blog/blogversion";
    import { newVersionStack } from "$lib/utils/blog/NewVersionStore/newVersionStore";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { createEventDispatcher } from "svelte";
    import VersionCard from "../versions/VersionCard.svelte";
    import { slide } from "svelte/transition";

    export let blogPost: BlogPost | undefined;
    export let selectedVersionId: string | undefined;

    const dispatch = createEventDispatcher();

    const showVersionManagement = persistedStore("ui_show_version_management", true)

    function handleLoadVersion(versionId: string) {
        dispatch("loadVersion", versionId)
    }
</script>

<div class="w-full max-w-sm">

    <div class="flex">
        <button on:click={() => ($showVersionManagement = !$showVersionManagement)} class="flex flex-row items-center justify-start w-full text-gray-700 hover:text-black font-semibold">
            <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$showVersionManagement}>
                <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
            </span>
            <h2>All Versions</h2>
        </button>

        <button
            class:opacity-0={!$showVersionManagement}
            class:opacity-100={$showVersionManagement}
            class="transform transition-transform duration-300"
            class:-rotate-90={!$showVersionManagement} 
            on:click={() => newVersionStack.open({ 
                blogPost: blogPost, 
                baseVersionId: undefined
            })}
        >
            <Iconify iconId={"material-symbols-light:add-rounded"} button={true}/>
        </button>
    </div>

    {#if $showVersionManagement}
        <div class="mt-2 w-full flex flex-col space-y-1" transition:slide={{ duration: 200 }}>
            {#if !blogPost?.versions?.length}
                <p>No Versions</p>
            {:else}
                {#each blogPost?.versions as version}
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
