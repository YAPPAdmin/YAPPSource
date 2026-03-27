<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { slide } from "svelte/transition";
    import VersionCard from "./VersionCard.svelte";
    import type { PageLayoutVersion } from "$lib/utils/pageEditor/PageLayoutVersion";

    export let selectedVersion: PageLayoutVersion | undefined;

    const show = persistedStore("ui_pl_selected_version_open", true);
</script>

<div class="w-full max-w-sm">
    <button 
        on:click={() => ($show = !$show)} 
        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
    >
        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
        </span>
        <h2>Selected Version</h2>
    </button>

    {#if $show}
        <div class="mt-2 w-full" transition:slide={{ duration: 200 }}>
            <VersionCard version={selectedVersion} selectedVersionId={selectedVersion?.id}/>
        </div>
    {/if}
</div>
