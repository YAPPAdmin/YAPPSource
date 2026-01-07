<script lang="ts">
  import { popupStack } from "$lib/popups/popup";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { fileUploadStack } from "./upload";
    import { fly, fade } from "svelte/transition";

    $: current = $fileUploadStack.at(-1);

    let files: File[] = [];
    let filePicker: HTMLInputElement;

    let name = "";
    let description = "";
    let source = "";

    let isDragOver = false;
    let previews: string[] = [];

    function handleFileChange(event: Event) {
        const selected = Array.from((event.target as HTMLInputElement).files ?? []);

        // Revoke old previews
        previews.forEach(url => URL.revokeObjectURL(url));

        files = selected;
        previews = selected.map(f => URL.createObjectURL(f));

        isDragOver = false;
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        const dropped = Array.from(event.dataTransfer?.files ?? [])
            .filter(f => f.type.startsWith("image/"));

        // Revoke old previews
        previews.forEach(url => URL.revokeObjectURL(url));

        files = dropped;
        previews = dropped.map(f => URL.createObjectURL(f));

        isDragOver = false;
    }


    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        isDragOver = true;
    }

    async function upload() {
        if (files.length === 0) {
            alert("Please select a file first!");
            return;
        }

        fileUploadStack.close();

        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("name", file.name.replace(/\s+/g, "-"));
            formData.append("description", description);
            formData.append("source", source);

            const result = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            if (!result.ok) {
                const message = await result.text();
                popupStack.open({
                    title: "File Upload Failed",
                    variant: "toast",
                    type: "text",
                    message: message
                });
            }
        }

        popupStack.open({
            title: "Files Uploaded",
            variant: "toast",
            type: "text",
            message: `${files.length} file(s) uploaded successfully!`
        });

        // Reset for next upload
        files = [];
        previews.forEach(url => URL.revokeObjectURL(url));
        previews = [];
    }


    function close() {
        isDragOver = false;
        previews = undefined;
        file = undefined;
        fileUploadStack.close()
    }

</script>

{#if current}
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50" transition:fade>
        <div class="max-w-[800px] w-full items-center space-y-5 bg-white rounded-2xl p-6 shadow-lg" transition:fly={{ y: 20 }}>

            <!-- Hidden File Input -->
            <input
                type="file"
                accept="image/*"
                multiple
                bind:this={filePicker}
                on:change={handleFileChange}
                class="absolute w-0 h-0 opacity-0 pointer-events-none"
            />

            <div class="flex space-x-10">
                <!-- File Select / Dropdown Area -->
                {#if previews.length > 0}
                    <div class="grid grid-cols-2 gap-4 w-1/2 border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 overflow-y-auto max-h-[400px]">
                        {#each previews as url, i}
                            <img 
                                src={url} 
                                alt={files[i]?.name} 
                                class="object-contain object-center rounded-lg"
                                transition:fade
                            />
                        {/each}
                    </div>
                {:else}

                    <div 
                        class="w-1/2 cursor-pointer text-center p-24 flex flex-col justify-center items-center bg-white border border-dashed border-gray-300 rounded-xl"
                        on:click={(() => {filePicker.click()})}
                        on:drop={handleDrop}
                        on:dragover={handleDragOver}    
                        role="button"
                        tabindex="0"
                        on:keydown={(event) => (event.key == "Enter" || event.key == "") && filePicker.click()}
                    >
                        <span class="inline-flex justify-center items-center size-16">
                            <Iconify
                                iconId="material-symbols-light:upload-file-outline-rounded"
                                height={isDragOver ? 56 : 64}
                            />         
                        </span>

                        <div class="mt-4 flex flex-wrap justify-center text-sm/6 text-gray-600">
                            
                            <!-- Dropdown -->
                            <span class="pe-1 font-medium text-gray-800">
                                Drop your file here or
                            </span>

                            <!-- File Select -->
                            <button on:click={(() => filePicker.click())} class="bg-white font-semibold text-primary-600 hover:text-primary-700 rounded-lg decoration-2 hover:underline focus-within:outline-hidden focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2">
                                browse
                            </button>
                        </div>

                        <p class="mt-1 text-xs text-gray-400">
                            Pick a file up to 2MB.
                        </p>
                    </div>

                {/if}


                <!-- Data -->
                {#if current.hasName || current.hasDescription || current.hasSource}

                    <div class="space-y-5 w-1/2">

                        <h2>Image Data</h2>
                        <hr />

                        {#if current.hasName}
                            <Tooltip fullWidth={true} text={"A short alternative name that displays if the image fails to load"}>
                                <input bind:value={name} placeholder="Name" />
                            </Tooltip>
                        {/if}

                        {#if current.hasDescription}
                            <Tooltip fullWidth={true} text={"A brief description of what the image contains for accessibility and context"}>
                                <input bind:value={description} placeholder="Description" />
                            </Tooltip>  
                        {/if}

                        {#if current.hasSource}
                            <Tooltip fullWidth={true} text={"The original source of the image (photographer, website, or license info)"}>
                                <input bind:value={source} placeholder="Source" />
                            </Tooltip>  
                        {/if}

                    </div>
                {/if}
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-center ml-auto mr-0 gap-5">
                <button class="defaultButton !bg-error-default" on:click={close}> 
                    Close
                </button>

                <button on:click={upload} disabled={files.length == 0} class="defaultButton">
                    Upload
                </button>
            </div>
        </div>
    </div>  
{/if}

