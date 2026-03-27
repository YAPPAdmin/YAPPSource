<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { fileUploadStack, type FileWrapper } from "$lib/uploads/upload";
    import { createEventDispatcher, onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import Image from "$lib/svelteComponents/display/Images/ImageCard.svelte"
    import { flip } from "svelte/animate";

    const dispatch = createEventDispatcher();

    export let registry: any[] = []
    export let selectedId: string = ""

    let searchQuery: string = ""
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

    function toggleSort(type: "name" | "date") {
        if(sortBy == type) {
            sortOrder = sortOrder == "asc" ? "desc" : "asc";
        } else {
            sortBy = type;
            sortOrder = "asc"
        }
    }

    onMount(async () => {
        if(!registry.length) {
            try {
                const result = await fetch("/api/upload")
                const data = await result.json()

                if(!data.result.length) return;

                registry = data.result.map((entry) => {
                    const idString = typeof entry.id == "object" ? entry.id.id : entry.id;
                    
                    const newWrapper: FileWrapper = {
                        id: idString,
                        name: entry.name || idString,
                        description: entry.description || "",
                        source: entry.source || "",
                        online: entry.online,
                        ext: entry.ext,
                        uploadTime: entry.uploadTime,
                        size: entry.size || undefined,
                        metadata: entry.metadata,
                    }

                    return newWrapper;

                })

            } catch(error) {
                console.error("Something went wrong trying to display these images", error)
            }
        } 
    })

</script>

<div class="flex flex-col h-full rounded-xl p-2 shadow-2xl bg-white overflow-hidden">

    <!-- Search and filter -->
    <div class="flex flex-row items-center mb-2 shrink-0">
        <!-- Search Bar -->
        <div class="flex-1 flex space-x-2 items-center justify-center">
            <div class="w-full flex items-center justify-center border border-gray-200 rounded-lg">
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

    <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {#each sortedRegistry as entry, i (entry.id)}
                <div 
                    animate:flip={{ duration: 300 }}
                    in:fly={{ y: 20, duration: 400, delay: i * 30 }}
                    class="{entry.id == selectedId ? 'ring-4 ring-primary-500' : ''} group relative aspect-square rounded-xl shadow-xl overflow-hidden bg-gray-100 hover:scale-105 transition-all duration-300"
                >
                    <button 
                        type="button" 
                        class="w-full h-full cursor-pointer focus:outline-none"
                        on:click|preventDefault|stopPropagation={() => dispatch("select", entry)}
                    >
                        <Image 
                            src={entry}
                        />
                    </button>
                </div>
            {/each}
        </div>

        <div class="flex flex-col w-full mt-3 justify-center items-center">
            <h2 class="text-lg! m-0! p-0!" >Not Enough?</h2>
            <p class="text-sm!" >Add more images to your library</p>
            <button
                class="defaultButton text-sm! p-2! mt-2!"
                on:click={(() => fileUploadStack.open({            
                    hasDescription: true,
                    hasName: true,
                    hasSource: true,
                }))}>
                    Add Image
            </button>
        </div>

    </div>

</div>