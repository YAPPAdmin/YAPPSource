<script lang="ts">
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import type { BlogPostVersion } from "$lib/utils/blog/blogversion";
    import { formatTime, formatDate } from "$lib/utils/util";
    import { fade, slide } from "svelte/transition";

    export let version: BlogPostVersion | undefined = undefined;
    export let selectedVersionId: string = "";
    export let currentlySendingSave: boolean | undefined = undefined;
    export let hasUnsavedChanges: boolean | undefined = undefined;

    // Dropdowns
    let showDetailsDropdown: boolean = false;

    // Dropdown Labels
    $: detailsLabel = showDetailsDropdown ? "Hide Details" : "Show Details";
    $: isSelected = version ? version.id === selectedVersionId : false;

    // Conditionall styling based on version parameters active/public/editing
    $: typeClass = "bg-gray-50 border-gray-200";
    
    $: selectionClass = isSelected 
        ? "ring-2 ring-primary-500 shadow-md scale-[1.02]" 
        : "bg-gray-50 border-gray-200 hover:shadow hover:bg-gray-100 hover:scale-[1.01]";

</script>

{#if !version}
    <div class="animate-pulse bg-gray-200 rounded-xl h-32 w-full mb-8 shadow-sm"></div>
{:else}
    <div class="relative w-fit">
            
        <div class="absolute -top-3 -left-2 z-10 flex gap-1">
            <!-- Is Active -->
            {#if version.isMainVersion}
                <Tooltip text={"This is the main Active Version"}>
                    <div class="bg-blue-500 p-0.5 pr-2 rounded-xl cursor-default flex items-center gap-1 min-w-0">
                        <Iconify iconId={"material-symbols-light:crown-outline-rounded"} style={"color: white"} height={20} />
                        <p class="text-xs! font-bold text-white! truncate min-w-0">Main</p>
                    </div>
                </Tooltip>           
            {/if}

            <!-- Is Public -->
            {#if version.isPublicVersion}
                <Tooltip text={"This Version is Public"}>
                    <div class="bg-green-500 p-0.5 pr-2 rounded-xl cursor-default flex items-center gap-1 min-w-0">
                        <Iconify iconId={"material-symbols-light:public"} style={"color: white"} height={20}/>
                        <p class="text-xs! font-bold text-white! truncate min-w-0">Public</p>
                    </div>
                </Tooltip>
            {/if}
        </div>

        <div role="button" class={`text-left min-w-36 cursor-pointer p-2 rounded-xl mb-8 shadow-xl ${typeClass} ${selectionClass}`}>
            <div class={`grow p-1 space-y-2 rounded`}>

                <!-- Version Title -->
                <div>
                    <div class="flex items-center justify-between">
                        <h2 class="text-xs! m-0!">Version {version.versionNumber}</h2>
                        <h2 class="text-xs! m-0!">{formatDate(version.lastChangeDate)}-{formatTime(version.lastChangeDate)}</h2>
                    </div>
                    
                    <h1 class="text-base! m-0!">{version.EditorData.title}</h1>
                </div>


                <!-- Details -->
                <div class="space-y-2.5 w-full">

                    <!-- Version Description -->
                    {#if version.EditorData.description}
                        <div>
                            <h2 class="text-xs! m-0!">Description</h2>
                            <p class="text-sm text-gray-500!">{version.EditorData.description}</p>
                        </div>
                    {/if}

                    <!-- Details Dropdown -->
                    <div>
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
                            <div class="pl-2 space-y-2 ml-5" transition:slide>
                                <!-- Title -->
                                <div>
                                    <h3 class="text-xs! m-0!">Title</h3>
                                    <p class="text-xs truncate hover:text-clip">{version.versionData.title}</p>
                                </div>

                                <!-- Description -->
                                <div>
                                    <h3 class="text-xs! m-0!">Description</h3>
                                    <p class="text-xs truncate hover:text-clip">{version.versionData.description}</p>
                                </div>

                                <!-- Version Title -->
                                <div>
                                    <h3 class="text-xs! m-0!">Version Title</h3>
                                    <p class="text-xs truncate hover:text-clip">{version.versionNumber}-{version.EditorData.title}</p>
                                </div>

                                <!-- Version Description -->
                                <div>
                                    <h3 class="text-xs! m-0!">Version Description</h3>
                                    <p class="text-xs truncate hover:text-clip">{version.EditorData.description}</p>
                                </div>


                                <!-- ID -->
                                <div>
                                    <h3 class="text-xs! m-0!">ID</h3>
                                    <p class="text-xs truncate hover:text-clip">{version.id}</p>
                                </div>

                                <!-- Last Update -->
                                <div>
                                    <h3 class="text-xs! m-0!">Last Update</h3>
                                    <p class="text-xs">{formatDate(version.lastChangeDate)} - {formatTime(version.lastChangeDate)}</p>
                                </div>

                                <!-- Category -->
                                {#if version.versionData.metadata.category}
                                    <div>
                                        <h3 class="text-xs! m-0!">Category</h3>
                                        <p class="text-xs">{version.versionData.metadata.category}</p>
                                    </div>
                                {/if}

                                <!-- Tags -->
                                {#if version.versionData.metadata.tags?.length}
                                    <div>
                                        <h3 class="text-xs! m-0!">Tags</h3>
                                        {#each version.versionData.metadata.tags as tag}
                                            <p class="text-xs">{tag}</p>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>

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
    </div>
{/if}