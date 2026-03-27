<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import type { BlogPostVersion } from "$lib/utils/blog/blogversion";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { slide } from "svelte/transition";
    import VersionCard from "../versions/VersionCard.svelte";

    export let selectedVersion: BlogPostVersion | undefined;

    const showSelectedVersion = persistedStore("ui_selected_version_open", true);
</script>

<div class="w-full max-w-sm">
    <button 
        on:click={() => ($showSelectedVersion = !$showSelectedVersion)} 
        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
    >
        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$showSelectedVersion}>
            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
        </span>
        <h2>Selected Version</h2>
    </button>

    {#if $showSelectedVersion}
        <div class="mt-2 w-full" transition:slide={{ duration: 200 }}>
            <VersionCard version={selectedVersion} selectedVersionId={selectedVersion?.id}/>
        </div>
    {/if}
</div>
