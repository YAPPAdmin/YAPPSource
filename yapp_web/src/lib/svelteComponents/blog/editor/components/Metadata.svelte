<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import type { VersionDraft } from "$lib/utils/blog/blogversion";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";

    export let selectedDraft: VersionDraft | undefined = undefined;

    const dispatch = createEventDispatcher();

    const show = persistedStore("ui_show_metadata", true)
    const showVersionData = persistedStore("ui_show_version_data", false);
    const showEditorData = persistedStore("ui_show_editor_data", false);

    function handleUpdate() {
        selectedDraft = selectedDraft
        dispatch("update")
    }

    function goPublic() {
        return
    }

    function goPrivat() {
        return;
    }

    function setMain() {
        return;
    }

    function removeMain() {
        return;
    }

</script>

<div class="w-full max-w-sm">
    <button 
        on:click={() => ($show = !$show)} 
        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
    >
        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
        </span>
        <h2>Data</h2>
    </button>

    {#if $show}
        <div class="w-full" transition:slide={{ duration: 200 }}>
            {#if !selectedDraft}
                <div class="animate-pulse space-y-4 w-full">
                    <div class="h-8 bg-gray-200 rounded w-full"></div>
                    <div class="h-8 bg-gray-200 rounded w-full"></div>
                </div>
            {:else}
                <div>
                    <button 
                        on:click={() => ($showVersionData = !$showVersionData)} 
                        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
                    >
                        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$showVersionData}>
                            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
                        </span>
                        <h3>Blog Data (Public)</h3>
                    </button>

                    {#if $showVersionData}
                        <div class="space-y-4 mt-2">
                            <p class="font-semibold! text-secondary-500! text-sm!">Visible to your readers.</p>
                            <!-- Title -->
                            <div>
                                <label for="versionDataTitle" class="block text-sm font-medium text-primary-500">Title</label>
                                <input 
                                    id="versionDataTitle" 
                                    type="text" 
                                    on:input={handleUpdate} 
                                    bind:value={selectedDraft.versionData.title} 
                                    placeholder="Title of this Version" 
                                />
                            </div>

                            <!-- Description -->
                            <div>
                                <label for="versionDataDescription" class="block text-sm font-medium text-primary-500">Description</label>
                                <textarea 
                                    id="versionDataDescription" 
                                    rows="3"
                                    on:input={handleUpdate} 
                                    bind:value={selectedDraft.versionData.description} 
                                    placeholder="Title of this Version" 
                                />
                            </div>
                        </div>
                    {/if}

                    <button 
                        on:click={() => ($showEditorData = !$showEditorData)} 
                        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
                    >
                        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$showEditorData}>
                            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
                        </span>
                        <h3>Version Data (Internal)</h3>
                    </button>

                    {#if $showEditorData}
                        <div class="space-y-2 mt-2">
                            <p class="font-semibold! text-secondary-500! text-sm!">Only visible to you.</p>

                            <div>
                                <label for="versionDataTitle" class="block text-sm font-medium text-primary-500">Title</label>
                                <input 
                                    id="versionDataTitle" 
                                    type="text" 
                                    on:input={handleUpdate} 
                                    bind:value={selectedDraft.editorData.title} 
                                    placeholder="e.g., Draft 2, Summer Update..."
                                />
                            </div>

                            <div>
                                <label for="versionDataDescription" class="block text-sm font-medium text-primary-500">Description</label>
                                <textarea 
                                    id="versionDataDescription" 
                                    rows="3"
                                    on:input={handleUpdate} 
                                    bind:value={selectedDraft.editorData.description} 
                                    placeholder="Notes about what changed in this draft"
                                />
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</div>