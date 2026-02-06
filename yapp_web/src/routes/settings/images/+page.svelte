<script lang="ts">
    import { fileUploadStack, type FileWrapper } from "$lib/uploads/upload";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import ImageCardEditor from "$lib/svelteComponents/display/Images/ImageCardEditor.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import FileUploadProgress from "$lib/svelteComponents/display/FileUploadProgress.svelte";
    import { fade } from "svelte/transition";
    import { uploadProgress } from "$lib/uploads/upload";

    let preloadRegistry = page.data.fileRegistry;

    let isLoading = false;
    let registry: any[] = [];
    let searchQuery: string = "";
    let sortBy: "name" | "date" = "name";
    let sortOrder: "asc" | "desc" = "asc";

    $: filteredRegistry = registry.filter(file => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
            file.name.toLowerCase().includes(search) ||
            file.description.toLowerCase().includes(search) ||
            file.source.toLowerCase().includes(search)
        );
    });

    $: sortedRegistry = [...filteredRegistry].sort((a, b) => {
        if (sortBy === 'name') {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return sortOrder === 'asc' 
                ? nameA.localeCompare(nameB, undefined, { numeric: true })
                : nameB.localeCompare(nameA, undefined, { numeric: true });
        } else {
            // Sort by Date (uploadTime)
            const dateA = new Date(a.uploadTime || 0).getTime();
            const dateB = new Date(b.uploadTime || 0).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
    });

    let wasUploading = false; 

    $: {
        if ($uploadProgress.isUploading) {
            wasUploading = true;
        } else if (wasUploading && !$uploadProgress.isUploading) {
            wasUploading = false;
            updateRegistry();
        }
    }

    function toggleSort(type: "name" | "date") {
        if(sortBy == type) {
            sortOrder = sortOrder == "asc" ? "desc" : "asc";
        } else {
            sortBy = type;
            sortOrder = "asc"
        }
    }
    

    onMount(() => {
        registry = preloadRegistry.fileRegistry.map((entry) => {
            const idString = typeof entry.id == "object" ? entry.id.id : entry.id;
            
            const newWrapper: FileWrapper = {
                id: idString,
                name: entry.name || idString,
                description: entry.description || "",
                source: entry.source || "",
                blobURL: entry.url,
                online: entry.online,
                ext: entry.ext,
                uploadTime: entry.uploadTime,
                size: entry.size || undefined,
                metadata: entry.metadata,
            }

            return newWrapper;
        })
    })

    async function updateRegistry() {
        isLoading = true;
        
        try {
            const result = await fetch("/api/upload")
            const data = await result.json();

            if(!data.result.length) return;

            registry = data.result.map((entry) => {
                const idString = typeof entry.id == "object" ? entry.id.id : entry.id;
                
                const newWrapper: FileWrapper = {
                    id: idString,
                    name: entry.name || idString,
                    description: entry.description || "",
                    online: entry.online || "",
                    source: entry.source || "",
                    size: entry.size || 0,
                    uploadTime: entry.uploadTime,
                    metadata: entry.metadata,
                }

                return newWrapper;
            });

        } catch(error) {
            console.log("Error updating image registry", error);
        } finally {
            isLoading = false;
        }
    }


</script>

<div class="space-y-10">

    <div class="w-full h-100 space-y-5">

        {#if registry.length || isLoading || $uploadProgress.isUploading}
            <div class="w-full h-20 overflow-auto flex items-center justify-between">
                <div class="w-full flex items-center space-x-5">
                    
                    <!-- Reload -->
                    <button 
                        class="p-1 rounded-full bg-primary-500 hover:bg-primary-600 transition-all duration-300" 
                        on:click={updateRegistry}
                    >
                        <Iconify iconId={"material-symbols-light:forward-media-rounded"} style={"color: white"} />
                    </button>
                    
                    <!-- Search Bar -->
                    <div class="flex space-x-2 items-center justify-center">
                        <div class="sm:w-80 w-40 flex items-center justify-center border border-gray-200 rounded-lg">
                            <Iconify iconId={"material-symbols-light:search-rounded"} />
                            <input bind:value={searchQuery} class="p-2 w-full sm:text-sm !border-none !bg-none !hover:bg-none" type="text" placeholder="Search">
                        
                            {#if searchQuery}
                                <button 
                                    on:click={() => {searchQuery = ""}}
                                    transition:fade={{ duration: 200 }}
                                    class="bg-red-500 mr-2 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all duration-600"
                                >
                                    <Iconify iconId="material-symbols:delete-outline" height={20} style="color: white" />
                                </button> 
                            {/if}
                        
                        </div>
                    </div>

                    <!-- Sort Buttons -->
                    <div class="flex space-x-2 items-center justify-center">
                        <div class="flex items-center justify-center">
                            <div class="items-center justify-center flex flex-col w-5"> 
                                <div class={sortBy == "name" ? "opacity-100" : "opacity-0"}>
                                    <Iconify 
                                        iconId={sortOrder == "asc" ? "material-symbols-light:arrow-upward-rounded" : "material-symbols-light:arrow-downward-rounded"} 
                                        height={20}
                                        />
                                </div>
                            </div>

                            <button on:click={() => toggleSort("name")} class="p-1 rounded-full bg-primary-500 hover:bg-primary-600 transition-all duration-300">
                                <Iconify iconId={"material-symbols-light:sort-by-alpha-outline-rounded"} style={"color: white"} />
                            </button>
                        </div>

                        <div class="flex items-center justify-center">
                            <button on:click={() => toggleSort("date")} class="p-1 rounded-full bg-primary-500 hover:bg-primary-600 transition-all duration-300">
                                <Iconify iconId={"material-symbols-light:event-outline-rounded"} style={"color: white"}/>
                            </button>

                            <div class="items-center justify-center flex flex-col w-5"> 
                                <div class={sortBy == "date" ? "opacity-100" : "opacity-0"}>
                                    <Iconify 
                                        iconId={sortOrder == "asc" ? "material-symbols-light:arrow-upward-rounded" : "material-symbols-light:arrow-downward-rounded"} 
                                        height={20}
                                        />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>  

                <div class="w-full flex items-center justify-end space-x-5">
                    <div>
                        <FileUploadProgress />
                    </div>

                    <button 
                        class="defaultButton !mt-0"
                        on:click={(() => fileUploadStack.open({            
                            hasDescription: true,
                            hasName: true,
                            hasSource: true,
                        }))}
                    >
                        <Iconify iconId={"material-symbols-light:add-photo-alternate-outline-rounded"} style={"color: white"} />
                        Add Image
                    </button>
                </div>
            </div>
        {/if}


        <div class="w-full h-full min-h-fit flex items-center justify-center">

            {#if isLoading}
                <div class="animate-spin inline-block size-8 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                    <span class="sr-only">Loading...</span>
                </div>
            {:else if registry.length > 0}
                <div class="w-full h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                    <div class="p-5 grid grid-cols-[repeat(auto-fill,minmax(370px,1fr))] gap-6 w-full">
                        {#each sortedRegistry as entry, i (entry.id)}
                            <ImageCardEditor 
                                file={entry}
                                index={i}
                                forceDetails={Boolean(searchQuery)}
                                on:delete={(event) => {
                                    const id = event.detail.id;
                                    registry = registry.filter(item => item.id != id)
                                }}
                            />
                        {/each}
                    </div>

                    {#if !sortedRegistry.length}
                        <div class="my-50 flex flex-col justify-center items-center">
                            <h2>No images found</h2>
                            <p>Add more images to your library</p>
                            <button
                                class="defaultButton"
                                on:click={(() => fileUploadStack.open({            
                                    hasDescription: true,
                                    hasName: true,
                                    hasSource: true,
                                }))}>
                                    Add Image
                            </button>
                        </div>
                    {:else}
                        <div class="my-50 flex flex-col justify-center items-center">
                            <h2>Not Enough?</h2>
                            <p>Add more images to your library</p>
                            <button
                                class="defaultButton"
                                on:click={(() => fileUploadStack.open({            
                                    hasDescription: true,
                                    hasName: true,
                                    hasSource: true,
                                }))}>
                                    Add Image
                            </button>
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="flex flex-col justify-center items-center">
                    <h3>Your Gallery is empty</h3>
                    <p>Start building your image library.</p>
                    <button
                        class="defaultButton"
                        on:click={(() => fileUploadStack.open({            
                            hasDescription: true,
                            hasName: true,
                            hasSource: true,
                        }))}>
                            Add Image
                    </button>
                </div>
            {/if}

        </div>
    </div>
</div>