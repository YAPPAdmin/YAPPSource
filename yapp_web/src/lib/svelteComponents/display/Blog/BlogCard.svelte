<script lang="ts">
  import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
  import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
  import { formatDate, formatTime, formatByte } from "$lib/utils/util";
  import { scale, fade, slide } from "svelte/transition";


    let hovering = true;
    let isLoaded = true;
    let showId = false;
    let showDetails = false;
    let forceDetails = false;
    
    let file: any
    file.id = "ID"
    file.ext = "EXT"
    file.name = "NAME"
    file.description = "DESCRIPTION"



</script>

<div class="min-h-[200px]">
    <div 
        role="group"
        class="rounded-xl h-full flex flex-col bg-white border border-gray-200 shadow-md w-80 sm:w-96 transform transition-transform duration-200 hover:scale-102">

        <!-- Delete Button -->
        {#if hovering}
            <div transition:scale={{ duration: 150 }} class="absolute top-3 right-3 z-30">
                <button
                    class="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                >
                    <Iconify iconId="material-symbols:delete-outline" height={20} style="color: white" />
                </button>
            </div>
        {/if}

        <!-- Image container -->
        <div  class="rounded-t-xl relative w-full bg-gray-100 overflow-hidden flex items-center justify-center ">        
            <a 
                href={`/api/upload?getType=getImg&fileId=${file.id}`}
                target="_blank" 
                rel="noreferrer"    
            >
                <img
                    src={"https://picsum.photos/id/237/200/300"}
                    alt={"Test"}
                    class="w-full h-full object-cover  transition-opacity duration-500 {isLoaded ? 'opacity-100' : 'opacity-0'}"
                    loading="lazy"
                />
            </a>
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
                <Tooltip text={"Reset Changes"}>
                    <button transition:scale={{ duration: 200 }} class="defaultButton">Reset</button>
                </Tooltip>
                
                <Tooltip text={"Update Changes"}>
                    <button         
                        transition:scale={{ duration: 200 }}
                        class="defaultButton">Update</button>
                </Tooltip>
            </div>
        </div>
    </div>
</div>