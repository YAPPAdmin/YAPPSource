<script lang="ts">
    import { popupStack } from "$lib/popups/popup";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { Duration } from "surrealdb";
    import { fade, fly, scale, slide } from "svelte/transition";
    import { createEventDispatcher, onMount } from "svelte";
    import type { FileWrapper } from "$lib/uploads/upload";
    import { formatByte, formatDate, formatTime } from "$lib/utils/util";

    const dispatch = createEventDispatcher();

    export let file: FileWrapper;
    export let index: number;
    export let forceDetails: boolean = false;

    $: delay = (index % 4) * 150;
    
    let visible = false;
    let element: HTMLElement;

    let showDetails = false;
    let hovering = false;
    let isLoaded = false;
    let hasError = false;
    let showId = false;
    let isUploading = false;
    let imageSource: string = "";
    let originalFile = JSON.parse(JSON.stringify(file));
    $: hasChanges = JSON.stringify(file) !== JSON.stringify(originalFile);

    async function deleteImage() {
        try {
            const result = await fetch(`/api/upload?fileId=${file.id}`, {
                method: "DELETE"
            })

            if(result.ok) {
                popupStack.open({
                    variant: "toast",
                    type: "text",
                    title: "File Deleted",
                    message: `Successfully deleted ${file.name}.${file.ext}`  
                });

                dispatch("delete", { id: file.id })
            } else {
                popupStack.open({
                    variant: "toast",
                    type: "text",
                    title: "Error",
                    message: `Failed to deleted ${file.name}.${file.ext}`  
                });
                console.log(result)
            }

            return;

        } catch(error) {
            console.error(`Failed to delete image ${file.id} - ${file.name}${file.ext}\nError: ${error}`)
        }

        popupStack.open({
            variant: "toast",
            type: "text",
            title: "File deletion falied",
            message: `Failed to delete ${file.name}${file.ext}`  
        })
    }

    function resetImage() {
        file.name = originalFile.name
        file.source = originalFile.source
        file.description = originalFile.description
    }

    async function updateImage() {
        console.log("update")
        isUploading = true;

        try {
            const params = new URLSearchParams({
                id: file.id || "",
                name: file.name || "",
                description: file.description || "",
                source: file.source || "",
            })

            const result = await fetch(`/api/upload?${params.toString()}`, {
                method: "PUT"
            })

            const data = JSON.stringify(result)

            console.log("RESULT: ", data)

        } catch(error) {

        } finally {
            isUploading = false;
        }
    }

    onMount(() => {
        imageSource = file.online ? file.online : `/api/upload?getType=getImg&fileId=${file.id}`;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    setTimeout(() => {
                        visible = true;
                    }, delay);
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: 0.1
        });

        observer.observe(element);
        return () => observer.disconnect;
    })

</script>

<div bind:this={element} class="min-h-[200px]">
    {#if visible}
        <div 
            role="group"
            in:fly={{ y: 30, duration: 900, delay: 0, opacity: 0 }}
            out:scale={{ duration: 300, start: 0.95 }}
            on:focusin={() => hovering = true}
            on:focusout={() => hovering = false}
            on:mouseenter={() => hovering = true}
            on:mouseleave={() => hovering = false}
            class="rounded-xl h-full flex flex-col bg-white border border-gray-200 shadow-md w-80 sm:w-96 transform transition-transform duration-200 hover:scale-102">

            <!-- Online Icon -->
            {#if hovering && file.online}
                <a href={file.online} transition:scale={{ duration: 150 }} class="absolute top-3 left-3 z-30">
                    <Tooltip text={`Source: ${file.online}`}>
                        <div class="bg-primary-500 text-white rounded-full p-1.5 hover:bg-primary-600 transition-colors">
                            <Iconify iconId="material-symbols-light:globe" height={20} style="color: white" />
                        </div>
                    </Tooltip>
                </a>
            {/if}

            <!-- Delete Button -->
            {#if hovering}
                <div transition:scale={{ duration: 150 }} class="absolute top-3 right-3 z-30">
                    <button
                        on:click={deleteImage}
                        class="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                    >
                        <Iconify iconId="material-symbols:delete-outline" height={20} style="color: white" />
                    </button>
                </div>
            {/if}

            <!-- Image container -->
            <div 
                class="rounded-t-xl relative w-full bg-gray-100 overflow-hidden flex items-center justify-center"
                style="aspect-ratio: {file.metadata?.width || 4} / {file.metadata?.height || 3}; max-height: 300px;"
            >        

                <!-- Loading Skeleton -->
                {#if !isLoaded && !hasError}
                    <div 
                        transition:fade
                        class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50"
                    >
                        <div class="w-full h-full animate-pulse bg-gray-200"></div>
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-shimmer"></div>
                    </div>
                {/if}

                <!-- Error Display -->
                {#if hasError}
                    <div transition:fade class="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
                        <Iconify iconId="material-symbols-light:broken-image-outline-rounded" height={48} />
                        <span class="text-xs mt-2 font-medium">Image unavailable</span>
                    </div>
                {/if}

                <!-- Image -->
                {#if !hasError}
                    <a 
                        href={`/api/upload?getType=getImg&fileId=${file.id}`}
                        target="_blank" 
                        rel="noreferrer"    
                    >
                        <img
                            src={imageSource}
                            alt={file.description}
                            class="w-full h-full object-cover  transition-opacity duration-500 {isLoaded ? 'opacity-100' : 'opacity-0'}"
                            loading="lazy"
                            on:load={() => isLoaded = true}
                            on:error={() => { hasError = true; isLoaded = true; }}
                        />
                    </a>
                {/if}

            </div>

            <!-- Content -->
            <div class="p-4 md:p-5">
                <div>
                    <!-- FileName -->
                    <div class="flex items-center focus-within:border-secondary-500 transition-colors">    
                        <input class="!text-lg !p-2 !py-1 !border-none !text-secondary-500 font-bold" bind:value={file.name} placeholder="Source" />
                        {#if file.ext}
                            <span class="pe-2 text-gray-400">
                                .{file.ext}
                            </span>
                        {/if}
                    </div>

                    <!-- Show ID -->
                    <div class="flex items-center justify-between">
                        <button 
                            class="rounded-xl p-1 px-2 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-500"  
                            on:click={(() => showId = !showId)}
                        >
                            {showId ? file.id : "Show Id"}
                        </button>

                        {#if file.uploadTime}
                            <p class="!text-sm !text-gray-400">{formatDate(file.uploadTime)} {formatTime(file.uploadTime)}</p>
                        {:else}
                            <p class="!text-sm !text-gray-400">Unknown Upload Time</p>
                        {/if}
                    </div>
                </div>

                <!-- Description/Source -->
                <div class="mt-5 my-2 space-y-2">
                    <input class="!font-sm" bind:value={file.description} placeholder="Description" />
                
                    <input bind:value={file.source} placeholder="Source" />
                </div>

                <!-- Toggle Details -->
                {#if file.metadata}
                <button 
                    class="rounded-xl p-2 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-500" 
                    on:click={(() => showDetails = !showDetails)}
                >
                    {showDetails ? "Hide Details" : "Show Details"}
                </button>
                {/if}

                <!-- Detailed Metadata -->
                {#if file.metadata && ( showDetails || forceDetails )}
                    <div transition:slide={{ duration: 200 }}>
                        <!-- Grid -->
                        <div class="text-gray-600 text-sm grid grid-cols-2 gap-y-4 gap-x-2">

                            <!-- File Size -->
                            <div class="flex flex-row items-center justify-start text-left">
                                <Iconify iconId={"material-symbols-light:image-outline-rounded"} height={20} />
                                {#if file.online}
                                    <Tooltip text={`This image does not take up any of your storage. It is stored at ${file.online}`}>
                                        <p>Online Image</p>
                                    </Tooltip>
                                {:else}
                                    <p>
                                        File Size: <span class="text-tertiary-500 font-bold">{formatByte(file.size || 0)}</span>
                                    </p>
                                {/if}
                            </div>

                            <!-- Date -->
                            <div class="flex flex-row items-center justify-start text-left">
                                <Iconify iconId={"material-symbols-light:calendar-today-outline-rounded"} height={20} />
                                <p>
                                    Date: <span class="text-tertiary-500 font-bold">{file.metadata.dateTaken || "?"}</span>
                                </p>
                            </div>

                            <!-- Size -->
                            <div class="flex flex-row items-center justify-start text-left">
                                <Iconify iconId={"material-symbols-light:height-rounded"} height={20} />
                                <p>
                                    Height: <span class="text-tertiary-500 font-bold">{`${file.metadata.height || "?"} Pixel`}</span>
                                </p>
                            </div>

                            <div class="flex flex-row items-center justify-start text-left">
                                <Iconify iconId={"material-symbols-light:width-rounded"} height={20} />
                                <p>
                                    Width: <span class="text-tertiary-500 font-bold">{`${file.metadata.width || "?"} Pixel`}</span>
                                </p>
                            </div>

                            <!-- Camera -->
                            <div class="flex flex-row items-center justify-start text-left">
                                <Iconify iconId={"material-symbols-light:photo-camera-outline-rounded"} height={20} />
                                <p>
                                    Camera: <span class="text-tertiary-500 font-bold">{file.metadata.camera || "?"}</span>
                                </p>
                            </div>

                            <div class="flex flex-row items-center justify-start text-left">
                                <Iconify iconId={"material-symbols-light:camera"} height={20} />
                                <p>
                                    ISO: <span class="text-tertiary-500 font-bold">{file.metadata.iso || "?"}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                {/if}

                <div class="flex justify-end space-x-2 mt-4">
                    {#if hasChanges}
                        <Tooltip text={"Reset Changes"}>
                            <button transition:scale={{ duration: 200 }} on:click={resetImage} class="defaultButton">Reset</button>
                        </Tooltip>
                        
                        <Tooltip text={"Update Changes"}>
                            <button         
                                transition:scale={{ duration: 200 }}
                                on:click={updateImage} class="defaultButton">Update</button>
                        </Tooltip>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>