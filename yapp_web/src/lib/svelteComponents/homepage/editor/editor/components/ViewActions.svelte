<script lang="ts">
  import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { User } from "$lib/utils/auth/User";
    import { PageLayout } from "$lib/utils/pageEditor/PageLayout";  
    import type { PageLayoutVersion } from "$lib/utils/pageEditor/PageLayoutVersion";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

    export let selectedVersion: PageLayoutVersion | undefined;
    export let pageLayout: PageLayout | undefined = undefined;
    export let user: User | undefined = undefined;

    $: canDelete = user?.getId() === selectedVersion?.authorId || user?.getId() === pageLayout?.authorId;

    const dispatch = createEventDispatcher();

    const show = persistedStore("ui_pl_show_viewer_actions", true)
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
            <!-- Start Editing -->
            <button 
                class="defaultButton w-full! m-0!" 
                on:click={() => dispatch('startEditing')}
            >
                Create new Draft
            </button>

            <!-- Delete Version -->
            <button 
                class="defaultButton w-full! bg-error-default! hover:bg-error-light! m-0!" 
                disabled={!canDelete}
                on:click={() => dispatch('deleteVersion')}
            >
                Delete Version
            </button>     
        </div>
    {/if}
</div>