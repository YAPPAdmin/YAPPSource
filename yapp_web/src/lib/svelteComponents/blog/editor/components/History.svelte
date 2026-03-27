<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import type { BlogPostVersion, ChangeLogEntry, Revision } from "$lib/utils/blog/blogversion";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { formatDate, formatTime } from "$lib/utils/util";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";


    export let selectedVersion: BlogPostVersion | undefined = undefined;
    const dispatch = createEventDispatcher()

    function restoreToEntry(revision: Revision) {
        if (confirm(`Are you sure you want to restore the document to this exact point? Unsaved changes will be lost.`)) {
            dispatch('restore', { revision });
        }
    }

    $: timeline = selectedVersion?.revisions ? [...selectedVersion.revisions].reverse() : [];

    const show = persistedStore("ui_show_history", true)
</script>

<div class="w-full max-w-sm">
    <button 
        on:click={() => ($show = !$show)} 
        class="flex flex-row revisions-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
    >
        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
        </span>
        <h2>History</h2>
    </button>


    {#if $show}
        <div class="w-full flex flex-col gap-2" transition:slide={{ duration: 200 }}>
            {#if !selectedVersion}
                <div class="animate-pulse space-y-3">
                    <div class="h-16 bg-gray-200 rounded-lg w-full"></div>
                    <div class="h-16 bg-gray-200 rounded-lg w-full"></div>
                </div>
            {:else if timeline.length == 0}
                <p class="text-xs! text-gray-500!">No history available yet.</p>
            {:else}
                <div class="w-full flex flex-col space-y-2 ">
                    {#each timeline as revision}
                        <div class="relative group w-full space-y-1 rounded-2xl shadow-lg p-2">
                            <div class="absolute -left-1.75 top-1.5 h-3 w-3 rounded-full border-2 border-white transition-colors
                                {revision.action === 'create' ? 'bg-green-400 group-hover:bg-green-500' : 
                                revision.action === 'restore' ? 'bg-orange-400 group-hover:bg-orange-500' : 
                                'bg-secondary-400 group-hover:bg-primary-500'}">
                            </div>

                            <!-- Change Date/Author -->
                            <div class="flex justify-between revisions-start mb-2">
                                <div>
                                    <p class="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                                        {formatDate(revision.changeDate)} • {formatTime(revision.changeDate)}
                                    </p>
                                    <p class="text-[10px] text-gray-400 mt-0.5">
                                        By <span class="font-medium text-gray-500">{revision.authorId}</span>
                                    </p>
                                </div>

                                <button 
                                    on:click={() => restoreToEntry(revision)}
                                    class=""
                                >
                                    <Iconify iconId="material-symbols-light:settings-backup-restore-rounded" />
                                </button>
                            </div>

                            <!-- Change Message -->
                            {#if revision.changeMessage}
                                <p class="text-xs! text-secondary-500!">
                                    "{revision.changeMessage}"
                                </p>
                            {:else}
                                <p class="text-xs! text-gray-500!">
                                    No Change Message
                                </p>
                            {/if}

                            <div class="flex flex-wrap gap-1.5 mt-2">
                                    {#each revision.changedAreas as area}
                                        <span class="text-[9px]  text-secondary-500 border px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider">
                                            {area}
                                        </span>
                                    {:else}
                                        <span class="text-[10px] text-gray-400 italic">No tracked data changes</span>
                                    {/each}
                                </div>
                        </div>
                    {/each}
                </div>
            {/if}

        </div>
    {/if}
</div>