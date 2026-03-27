<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import type { User } from "$lib/utils/auth/User";
    import type { BlogPost } from "$lib/utils/blog/blog";
    import type { BlogPostVersion, ChangeLogEntry } from "$lib/utils/blog/blogversion";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { formatDate, formatTime } from "$lib/utils/util";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";

    export let selectedVersion: BlogPostVersion | undefined = undefined;

    const dispatch = createEventDispatcher();

    function getHumanReadablePath(path: string): string {
        if (path.includes('/content')) return 'Blog Content';
        if (path.includes('/title')) return 'Public Title';
        if (path.includes('/description')) return 'Public Description';
        if (path.includes('/metadata/category')) return 'Category';
        if (path.includes('/metadata/tags')) return 'Tags';
        return 'Settings';
    }

    function summarizeChanges(entry: ChangeLogEntry): string[] {
        const affectedAreas = new Set<string>();

        if(entry.changes?.patch) {
            entry.changes.patch.forEach(op => {
                if(op.path) affectedAreas.add(getHumanReadablePath(op.path));
            })
        }

        if (entry.changes?.isMainVersion !== undefined) affectedAreas.add("Main Version Status");
        if (entry.changes?.isPublicVersion !== undefined) affectedAreas.add("Public Status");
        if (entry.changes?.editorData) affectedAreas.add("Internal Metadata");

        return Array.from(affectedAreas)
    }

    $: reversedHistory = selectedVersion?.changeLog ? [...selectedVersion.changeLog].reverse() : [];

    const show = persistedStore("ui_show_differences", true)
</script>

<div class="w-full max-w-sm">
    <button 
        on:click={() => ($show = !$show)} 
        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
    >
        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
        </span>
        <h2>Differences</h2>
    </button>


    {#if $show}
        <div class="w-full flex flex-col gap-2" transition:slide={{ duration: 200 }}>
            {#if !selectedVersion}
                <div class="animate-pulse space-y-3">
                    <div class="h-16 bg-gray-200 rounded-lg w-full"></div>
                    <div class="h-16 bg-gray-200 rounded-lg w-full"></div>
                </div>
            {:else if reversedHistory.length == 0}
                <p class="text-gray-500!">No history available</p>
            {:else}
                <div class="space-y-2 pl-2">
                    {#each reversedHistory as entry }
                        <div class="relative">
                            <div class="absolute -left-1.25 top-1.5 h-2 w-2 rounded-full bg-secondary-400 border-2 border-white"></div>
                        
                            <div>
                                <!-- Author/Time Data -->
                                <div>
                                    <span>
                                        {formatDate(entry.changeDate)} at {formatTime(entry.changeDate)}
                                    </span>
                                    <span>
                                         {entry.changeAuthorId}
                                    </span>
                                </div>

                                {#if entry.changeMessage}
                                    <p>
                                        {entry.changeMessage}
                                    </p>
                                {/if}
                                
                                <div>
                                    {#each summarizeChanges(entry) as area}
                                        <span>
                                            {area}
                                        </span>
                                    {:else}
                                        <span>No Changes</span>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>