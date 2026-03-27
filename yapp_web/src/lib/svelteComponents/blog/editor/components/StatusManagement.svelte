<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import type { BlogPostVersion, VersionDraft } from "$lib/utils/blog/blogversion";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";

    export let selectedDraft: VersionDraft | undefined = undefined;
    export let selectedVersion: BlogPostVersion | undefined = undefined;

    const dispatch = createEventDispatcher()

    function togglePublic() {
        if(!selectedDraft) return;

        const nextState = !selectedDraft.isPublicVersion;
        const stateMsg = nextState ? "Set this Version to PUBLIC?" : "Set this Version to PRIVATE?"
        const checkMsg = `${stateMsg} This change will apply after saving to this/new Version`

        if(confirm(checkMsg)) {
            selectedDraft.isPublicVersion = nextState;
            selectedDraft = selectedDraft;
            dispatch("update")
        }
    }

    function toggleMain() {
        if(!selectedDraft) return;

        const nextState = !selectedDraft.isMainVersion;
        const stateMsg = nextState ? "Set this Version to MAIN?" : "Remove MAIN Status?"
        const checkMsg = `${stateMsg} This change will apply after saving to this/new Version`

        if(confirm(checkMsg)) {
            selectedDraft.isMainVersion = nextState;
            selectedDraft = selectedDraft;
            dispatch("update")
        }
    }

    const show = persistedStore("ui_show_viewer_actions", true)
</script>

<div class="w-full max-w-sm">
    <button 
        on:click={() => ($show = !$show)} 
        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
    >
        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
        </span>
        <h2>Status</h2>
    </button>

    {#if $show}
        {#if !selectedDraft || !selectedVersion}
            <div class="animate-pulse space-y-4 w-full">
                <div class="h-8 bg-gray-200 rounded w-full"></div>
                <div class="h-8 bg-gray-200 rounded w-full"></div>
            </div>
        {:else}
            <div class="w-full flex flex-col gap-2 mb-6" transition:slide={{ duration: 200 }}>
                <div class="space-y-4">

                    <!-- Public/Private -->
                    <div class="flex flex-col w-full space-y-2">
                        <!-- No Changes -->
                        {#if selectedDraft.isPublicVersion == selectedVersion.isPublicVersion}
                            <div class="w-full flex items-center justify-start space-x-1 text-sm font-medium text-gray-500">
                                <Iconify iconId={selectedVersion.isPublicVersion ? "material-symbols-light:public" : "material-symbols-light:public-off-rounded"} />
                                <div>
                                    {selectedVersion.isPublicVersion ? "Public Version" : "Private Version"}
                                    <p class="text-[10px] text-gray-400 font-normal">
                                        {selectedVersion.isPublicVersion ? "Allow readers to see this version." : "Readers cannot see this Version"}
                                    </p>
                                </div>
                            </div>
                        <!-- Changes -->
                        {:else}
                            <div class="w-full  flex items-center justify-start space-x-1 text-sm font-medium text-primary-500">
                                <span class="relative flex">
                                    <span class="absolute inline-flex animate-ping "><Iconify iconId={selectedDraft.isPublicVersion  ? "material-symbols-light:public" : "material-symbols-light:public-off-rounded"} /></span>
                                    <span class="relative inline-flex animate-pulse"><Iconify iconId={selectedDraft.isPublicVersion  ? "material-symbols-light:public" : "material-symbols-light:public-off-rounded"} /></span>
                                </span>
                                <div class="animate-pulse">
                                    {selectedDraft.isPublicVersion ? "Public Version" : "Private Version"}
                                    <p class="text-[10px] text-gray-400 font-normal">
                                        {selectedDraft.isPublicVersion 
                                            ? "This Version will go Public after the next Commit" 
                                            : "This Version will go Offline after the next Commit"
                                        }
                                    </p>
                                </div>
                            </div>
                        {/if}

                        <!-- Toggle -->
                        <div>
                            {#if selectedDraft.isPublicVersion == selectedVersion.isPublicVersion}
                                <button on:click={togglePublic} class="w-full! defaultButton m-0!">{selectedDraft.isPublicVersion ? "Go Offline" : "Go Online"}</button>
                            {:else}
                                <button on:click={togglePublic} class="w-full! defaultButton bg-error-default! hover:bg-error-light! m-0!">Cancel</button>
                            {/if}
                        </div>
                    </div>

                    <!-- Main -->
                    <div class="flex flex-col w-full space-y-2">
                        <!-- No Changes -->
                        {#if selectedDraft.isMainVersion == selectedVersion.isMainVersion}
                            <div class="w-full flex items-center justify-start space-x-1 text-sm font-medium text-gray-500">
                                <Iconify iconId={selectedVersion.isMainVersion ? "material-symbols-light:crown-outline-rounded" : "material-symbols-light:lock-outline"} />
                                <div>
                                    {selectedVersion.isMainVersion ? "Main Version" : "Not Main Version"}
                                    <p class="text-[10px] text-gray-400 font-normal">
                                        {selectedVersion.isMainVersion ? "Main Version" : "Not Main Version"}
                                    </p>
                                </div>
                            </div>
                        <!-- Changes -->
                        {:else}
                            <div class="w-full  flex items-center justify-start space-x-1 text-sm font-medium text-primary-500">
                                <span class="relative flex">
                                    <span class="absolute inline-flex animate-ping "><Iconify iconId={selectedDraft.isMainVersion  ? "material-symbols-light:crown-outline-rounded" : "material-symbols-light:lock-outline"} /></span>
                                    <span class="relative inline-flex animate-pulse"><Iconify iconId={selectedDraft.isMainVersion  ? "material-symbols-light:crown-outline-rounded" : "material-symbols-light:lock-outline"} /></span>
                                </span>
                                <div class="animate-pulse">
                                    {selectedDraft.isMainVersion ? "Main Version" : "Not Main Version"}
                                    <p class="text-[10px] text-gray-400 font-normal">
                                        {selectedDraft.isMainVersion 
                                            ? "Will be set as Main after next Commit" 
                                            : "Will be downgraded after next Commit"
                                        }
                                    </p>
                                </div>
                            </div>
                        {/if}

                        <!-- Toggle -->
                        <div>
                            {#if selectedDraft.isMainVersion == selectedVersion.isMainVersion}
                                <button on:click={toggleMain} class="w-full! defaultButton m-0!">{selectedDraft.isMainVersion ? "Remove Main" : "Set Main"}</button>
                            {:else}
                                <button on:click={toggleMain} class="w-full! defaultButton bg-error-default! hover:bg-error-light! m-0!">Cancel</button>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</div>