<script lang="ts">
    import type { BlogPostVersion } from "$lib/utils/blog";
    import { formatTime, formatDate } from "$lib/utils/util";
    import { fade, slide } from "svelte/transition";
    import Tooltip from "../base/Tooltip.svelte";
    import Iconify from "../iconify/Iconify.svelte";

    export let version: BlogPostVersion;
    export let currentlySendingSave: boolean | undefined = undefined;
    export let hasUnsavedChanges: boolean | undefined = undefined;

    // Style Conditions
    export let isEditing: boolean | undefined = undefined;

    // Dropdowns
    let showDetailsDropdown: boolean = false;
    let showHistoryDropdown: boolean = false;

    // Dropdown Labels
    $: detailsLabel = showDetailsDropdown ? "Hide Details" : "Show Details";
    $: historyLabel = showHistoryDropdown ? "Hide History" : "Show History";


    // Conditionall styling based on version parameters active/public/editing
    $: typeClass = "bg-gray-50 border-gray-200"; 

    $: if (isEditing) {
        typeClass = "bg-[repeating-linear-gradient(-45deg,#f2a417,#f2a417_15px,#141617_15px,#141617_30px)]";    
    } else if (version.public && version.active) {
        typeClass = "bg-[repeating-linear-gradient(-45deg,#00c951,#00c951_15px,#155dfc_15px,#155dfc_30px)]";
    } else if (version.public) {
        typeClass = "bg-green-500 border-green-300";
    } else if (version.active) {
        typeClass = "bg-blue-500 border-blue-300";
    }

</script>

<div role="button" class={`min-w-36 cursor-pointer p-2 rounded mb-8 ${typeClass}`}>
    <div class="grow p-2 bg-gray-100 hover:bg-gray-200 rounded ">
        <h3 class="flex  items-center !text-base !mt-0 gap-x-1.5 font-semibold text-gray-800 ">
            <!-- Version Number -->
            <Tooltip text={`Version Number ${version.versionNumber}`}>
                <p class="!text-primary-500 text-sm">{version.versionNumber}</p>
            </Tooltip>

            <p class="!text-gray-500 text-sm">-</p>
            
            <!-- Version Title -->
            <Tooltip text={"Edit the Title of this specific version"}>
                <input bind:value={version.versionTitle} class="truncate !text-primary-500 text-sm block w-full rounded-lg sm:text-sm bg-transparent border-transparent focus:border-green-400 focus:ring-0 hover:border-green-300 " />
            </Tooltip>
        </h3>

        <!-- Details -->
        <div class="space-y-2.5">
            <!-- Version Description -->
            <div class="max-w-sm space-y-3">
                <textarea bind:value={version.versionDescription} class="text-gray-700 p-1 sm:py-1 sm:px-2 block w-full border-2 border-gray-300 rounded-lg sm:text-sm " rows="3" placeholder="Version Description"></textarea>
            </div>

            <!-- Public/Active State -->
            <div class="flex flex-wrap justify-start gap-2">

                <!-- Is Active -->
                {#if version.active}
                    <Tooltip text={"This is the main Active Version"}>
                        <div class="bg-blue-500 p-1 pr-2 rounded-xl cursor-default flex items-center gap-1 min-w-0">
                            <Iconify iconId={"material-symbols-light:crown-outline-rounded"} style={"color: white"} height={20} />
                            <p class="text-sm font-bold !text-white truncate min-w-0">Active</p>
                        </div>
                    </Tooltip>
                {:else}
                    <Tooltip text={"This Version is not Public"}>
                        <div class="bg-gray-400 p-0.5 pr-1.5 rounded-xl cursor-default flex items-center gap-1 min-w-0">
                            <Iconify iconId="material-symbols-light:public-off-rounded" style={"color: white"} height={20} />
                            <p class="text-xs font-bold !text-white truncate min-w-0">Not Active</p>
                        </div>
                    </Tooltip>                    
                {/if}

                <!-- Is Public -->
                {#if version.public}
                    <Tooltip text={"This Version is Public"}>
                        <div class="bg-green-500 p-1 pr-2 rounded-xl cursor-default flex items-center gap-1 min-w-0">
                            <Iconify iconId={"material-symbols-light:public"} style={"color: white"} height={20}/>
                            <p class="text-sm font-bold !text-white truncate min-w-0">Public</p>
                        </div>
                    </Tooltip>
                {:else} 
                    <Tooltip text={"This Version is not Public"}>
                        <div class="bg-gray-400 p-0.5 pr-1.5 rounded-xl cursor-default flex items-center gap-1 min-w-0">
                            <Iconify iconId={"material-symbols-light:public-off-rounded"} style={"color: white"} height={20} />
                            <p class="text-xs font-bold !text-white truncate min-w-0">Not Public</p>
                        </div>
                    </Tooltip>
                {/if}

            </div>

            <!-- Details Dropdown -->
            <span>
                <div>
                    <Tooltip text={"Show/Hide more details about this Version"}>
                        <button on:click={() => {showDetailsDropdown = !showDetailsDropdown}} class="hover:cursor-pointer">
                            <div class="flex items-center justify-center"> 
                                <span
                                    class="transformtransition-transform duration-300"
                                    class:-rotate-90={!showDetailsDropdown}
                                ><Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} /></span>
                                <p>{detailsLabel}</p>
                            </div>
                        </button>
                    </Tooltip>
                </div>

                <!-- Details Dropdown -->
                {#if showDetailsDropdown}
                    <div class="pl-2 space-y-4" transition:slide>
                        <!-- ID -->
                        <div>
                            <p class="text-sm">ID: </p>
                            <p class="text-xs truncate hover:text-clip">{version.id}</p>
                        </div>

                        <!-- Last Update -->
                        <div>
                            <p class="text-sm">Updated: </p>
                            <p class="text-xs">{formatDate(version.updatedAt)} - {formatTime(version.updatedAt)}</p>
                        </div>

                        <!-- Category -->
                        {#if version.category}
                            <div>
                                <p class="text-sm">Category: </p>
                                <p class="text-xs">{version.category}</p>
                            </div>
                        {/if}

                        <!-- Tags -->
                        {#if version.tags.length > 0}
                            <div>
                                <p class="text-sm">Tags: </p>
                                {#each version.tags as tag}
                                    <p class="text-xs">{tag}</p>
                                {/each}
                            </div>
                        {/if}


                        <!-- Language -->
                        {#if version.language}
                            <div>
                                <p class="text-sm">Language: </p>
                                <p class="text-xs">{version.language}</p>
                            </div>
                        {/if}

                    </div>

                    <hr/>
                {/if}
            </span>

            <!-- History Dropdown -->
            {#if version.history}
                <div>
                    <Tooltip text={"Show/Hide more details about this Version"}>
                        <button on:click={() => {showHistoryDropdown = !showHistoryDropdown}} class="hover:cursor-pointer">
                            <div class="flex items-center justify-center"> 
                                <span
                                    class="transformtransition-transform duration-300"
                                    class:-rotate-90={!showHistoryDropdown}
                                ><Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} /></span>
                                <p>{historyLabel}</p>
                            </div>
                        </button>
                    </Tooltip>
                </div>
            {/if}


            <!-- Author -->
            <button type="button" class=" -ms-1 p-1 inline-flex items-center gap-x-2 text-xs rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none ">
                <p>Author Card</p>
            </button>

        </div>

        <div class="flex items-center justify-between">
            <!-- Unsaved changes -->
            <div>
                {#if currentlySendingSave != undefined && hasUnsavedChanges != undefined}
                    {#if currentlySendingSave} <!-- Currently Sending State -->
                    
                        <Tooltip text={"Saving changes ..."}>
                            <div class="inline-flex items-center">
                                <span class="size-2 inline-block bg-warning-default rounded-full me-2"></span>
                                <span class="text-gray-600 ">Saving ...</span>
                            </div>
                        </Tooltip>

                    {:else if hasUnsavedChanges} <!-- Unsaved changes State -->

                        <Tooltip text={"This draft currently has unsaved changes!"}>
                            <div class="inline-flex items-center">
                                <span class="size-2 inline-block bg-error-default rounded-full me-2"></span>
                                <span class="text-gray-600 ">Unsaved Changes</span>
                            </div>
                        </Tooltip>

                    {:else} <!-- No unsaved changes State -->

                        <Tooltip text={"Everythings up to date!"}>
                            <div class="inline-flex items-center">
                                <span class="size-2 inline-block bg-success-default rounded-full me-2"></span>
                                <span class="text-gray-600 ">Saved</span>
                            </div>
                        </Tooltip>

                    {/if}
                {/if}
            </div>
        </div>
    </div>
</div>