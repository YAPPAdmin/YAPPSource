<script lang="ts">
    import { popupStack } from "$lib/popups/popup";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { formatByte, isValidUrl } from "$lib/utils/util";
    import { fileUploadStack, initialProgress, loadExifData, type FileWrapper } from "./upload";
    import { fly, fade } from "svelte/transition";
    import { uploadProgress } from "./upload";

    $: current = $fileUploadStack.at(-1);
    $: totalSize = wrappedFiles.reduce((acc, item) => acc + (item?.file?.size || 0), 0);
    $: validUrl = isValidUrl(urlInput)

    let wrappedFiles: FileWrapper[] = [];
    let filePicker: HTMLInputElement;
    let isDragOver = false;
    let previewIndex: number = 0;
    let urlInput: string = "";
    let isFetchingOnlineImage = false;


    async function createWrappers(selectedFiles: File[]) {
        // Revoke old URLs
        if (wrappedFiles && wrappedFiles.length > 0) {
            wrappedFiles.forEach(file => {
                if (file && file.blobURL) URL.revokeObjectURL(file.blobURL); 
            });
        }

        const promises = selectedFiles.map(async (file) => {
            const url = URL.createObjectURL(file);

            let wrapper: FileWrapper = {
                file: file,
                name: file.name.split(".")[0].replace(/\s+/g, "-"),
                description: "",
                source: "",
                blobURL: url,
            }

            const img = new Image();
            img.onload = () => {
                wrapper.metadata = {}
                wrapper.metadata.width = img.naturalWidth;
                wrapper.metadata.height = img.naturalHeight;
                wrappedFiles = wrappedFiles; // Trigger reactivity
            }

            img.src = url;

            try {
                wrapper = await loadExifData(file, wrapper);
            } catch (error) {
                console.warn("Error loading metadata", error);
            }

            return wrapper;
        });

        wrappedFiles = await Promise.all(promises);        
        previewIndex = 0;
    }

    async function createOnlineWrapper() {
        if(!validUrl || !urlInput) return;

        try {
            // Check Image exists
            const response = await fetch(urlInput, { method: "HEAD" });
            
            if(!response.ok) return;

            const contentType = response.headers.get("Content-Type");
            if(!contentType || !contentType.startsWith("image/")) return;

            const dimensions = await new Promise<{ width: number, height: number }>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
                img.onerror = () => reject(new Error("Failed to load image dimensions"));
                img.src = urlInput;
            });

            // Create Wrapper
            const urlPath = new URL(urlInput).pathname;

            let wrapper: FileWrapper = {
                name: urlPath.split('/').pop()?.split('.')[0] || "online-image",
                description: "",
                source: new URL(urlInput).hostname,
                blobURL: urlInput,
                online: urlInput,
                metadata: {
                    width: dimensions.width,
                    height: dimensions.height
                }
            }

            wrappedFiles = [wrapper]
            urlInput = "";
            previewIndex = 0;

        } catch(error) {
            console.error("Error creating online wrapper:", error);
        }
    }

    async function removeFile(index: number) {
        // Revoke URL
        if(wrappedFiles[index]?.blobURL) URL.revokeObjectURL(wrappedFiles[index].blobURL)

        wrappedFiles = wrappedFiles.filter((_, i) => i != index);

        if(wrappedFiles.length == 0) {
            previewIndex = 0;
        } else if(index <= previewIndex) {
            previewIndex = Math.max(0, previewIndex - 1);
        }
    }

    async function handleFileChange(event: Event) {
        const selected = Array.from((event.target as HTMLInputElement).files || []);
        await createWrappers(selected);
    }

    async function handleDrop(event: DragEvent) {
        event.preventDefault();
        isDragOver = false;

        const dropped = Array.from(event.dataTransfer?.files || [])
            .filter(f => f.type.startsWith("image/"));

        await createWrappers(dropped);
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        isDragOver = true;
    }

    async function uploadFile() {
        if (wrappedFiles.length === 0) return;
        fileUploadStack.close();

        const filesToUpload = [...wrappedFiles];
        const total = wrappedFiles.length;
        
        if(!filesToUpload.length) return;

        uploadProgress.set({
            isUploading: true,
            percentage: 0,
            fileName: filesToUpload[0].name,
            fileSize: filesToUpload[0].file?.size || 0,
            thumbnail: filesToUpload[0].url || "",
            currentCount: 1,
            totalCount: total
        });

        for (let i = 0; i < total; ++i) {
            const item = filesToUpload[i];

            uploadProgress.update(s => ({
                ...s,
                fileName: item.name,
                fileSize: item.file?.size || 0,
                thumbnail: item.url || "",
                currentCount: i + 1,
                percentage: Math.round((i / total) * 100)
            }));

            const formData = new FormData();
            formData.append("file", item.file);
            formData.append("name", item.name);
            formData.append("description", item.description);
            formData.append("source", item.source);
            formData.append("online", item.online || "")

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

        // Completion State
        uploadProgress.update(s => ({ ...s, percentage: 100 }));

        const uploadMessage = filesToUpload.length > 1 ? `${total} files uploaded successfully!` : `${filesToUpload[0].file?.name || "File"} uploaded succesfully`;
        popupStack.open({
            title: "Files Uploaded",
            variant: "toast",
            type: "text",
            message: uploadMessage,
        });


        // Revoke URLs
        wrappedFiles.forEach(file => {
            if (file && file.url) URL.revokeObjectURL(file.url); 
        });

        // Timeout 
        setTimeout(() => {
            uploadProgress.set(initialProgress);
            wrappedFiles = [];
            
        }, 3000);
    }

    function close() {
        isDragOver = false;
        wrappedFiles = [];
        fileUploadStack.close()
    }

</script>

{#if current}
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-40" transition:fade>
        <div class=" w-1/2 h-2/3 items-center space-y-5 bg-white rounded-2xl p-6 shadow-lg" transition:fly={{ y: 20 }}>

            <!-- Hidden File Input -->
            <input
                type="file"
                accept="image/*"
                multiple
                bind:this={filePicker}
                on:change={handleFileChange}
                class="absolute w-0 h-0 opacity-0 pointer-events-none"
            />

            <div class="w-full h-full max-h-full flex space-x-10">
                <!-- File Select / Dropdown Area -->
                {#if wrappedFiles.length > 0}
                    <div 
                        class="w-2/3 h-full max-h-full flex flex-row items-center justify-center border border-dashed border-gray-300 rounded-xl p-2"
                        class:border-primary-500={isDragOver}
                        class:bg-blue-50={isDragOver}
                        on:drop={handleDrop}
                        on:dragover={handleDragOver}
                        on:dragleave={() => isDragOver = false}    
                        role="region"
                        aria-label="Image Preview and Replacement Drop Zone"
                    >

                        {#if isDragOver}
                            <div class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 rounded-xl backdrop-blur-sm pointer-events-none">
                                <div class="flex flex-col items-center text-primary-600 font-bold">
                                    <Iconify iconId="material-symbols-light:upload-file-outline-rounded" height={48} />
                                    <span>Drop to Replace</span>
                                </div>
                            </div>
                        {/if}
                        
                        <!-- Previous Image -->
                        <button 
                            disabled={previewIndex == 0} 
                            on:click={(() => {previewIndex -= 1})}
                            class="transition-opacity {previewIndex === 0 ? 'invisible' : 'visible'}"
                        >
                            <Iconify iconId={"material-symbols-light:arrow-back-ios-rounded"} />
                        </button>

                        <!-- Image Preview -->
                        <div class="flex items-center h-full w-full min-h-0 justify-center overflow-hidden">
                            {#key previewIndex}
                                <div class="relative m-5 max-w-full max-h-full h-fit flex items-center justify-center">
                                    <!-- Remove Button -->
                                    <button
                                        class="absolute top-0 right-0 z-50 p-1 shadow-lg hover:bg-white bg-white/90 text-gray-500 hover:text-red-500 rounded-full shadow-sm hover:shadow-md transition-all translate-x-2 -translate-y-2"
                                        on:click|stopPropagation={() => removeFile(previewIndex)}
                                        title="Remove this image"
                                    >
                                        <Iconify iconId="material-symbols-light:cancel-outline-rounded" height={20} style={"color: red"} />
                                    </button>


                                    <!-- Preview Image -->
                                    <button 
                                        class="h-fit w-fit flex items-center justify-center overflow-hidden"
                                        on:click={(() => {
                                        popupStack.open({
                                            type: "image", 
                                            variant: "modal",
                                            imageUrl: wrappedFiles[previewIndex].blobURL, 
                                            imageName: wrappedFiles[previewIndex].name, 
                                            imageAuthor: wrappedFiles[previewIndex].source})
                                        })}
                                    >
                                        <img 
                                            src={wrappedFiles[previewIndex].blobURL} 
                                            alt={`Preview ${wrappedFiles[previewIndex].name}` } 
                                            class="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-xl hover:cursor-zoom-in block"
                                            in:fade={{ duration: 300 }}
                                        />
                                    </button>
                                </div>
                            {/key}
                        </div>

                        <button 
                            disabled={previewIndex >= wrappedFiles.length - 1} 
                            on:click={(() => {previewIndex += 1})}
                            class="transition-opacity {previewIndex >= wrappedFiles.length - 1 ? 'invisible' : 'visible'}"    
                        >
                            <Iconify iconId={"material-symbols-light:arrow-forward-ios-rounded"} />
                        </button>
                    </div>
                {:else} <!--File Select / Dropdown Area-->
                    <div 
                        class="w-2/3  h-full space-y-5 p-24 text-center flex flex-col justify-center items-center border border-dashed border-gray-300 rounded-xl"
                        on:drop={handleDrop} 
                        on:dragover={handleDragOver}
                        on:dragleave={() => isDragOver = false}
                        role="button"
                        tabindex="0"
                        on:keydown={(event) => (event.key == "Enter" || event.key == "") && filePicker.click()}
                    >
                    
                        <!-- File/Online Preview -->
                        {#if !urlInput}
                            <!-- File -->
                            <div>
                                <span class="inline-flex justify-center items-center size-16">
                                    <Iconify
                                        iconId="material-symbols-light:upload-file-outline-rounded"
                                        height={isDragOver ? 64 : 56}
                                    />         
                                </span>

                                <div class="flex flex-wrap justify-center text-sm/6 text-gray-600">
                                    <!-- Dropdown -->
                                    <span class="pe-1 font-medium text-gray-800">
                                        Drop your file here or
                                    </span>

                                    <!-- File Select -->
                                    <button on:click={(() => {filePicker.click()})} class="bg-white font-semibold text-primary-600 hover:text-primary-700 rounded-lg decoration-2 hover:underline focus-within:outline-hidden focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2">
                                        browse
                                    </button>
                                </div>

                                <p class="mt-1 text-xs text-gray-400">
                                    Pick a file up to 2MB.
                                </p>
                            </div>
                        {:else}
                            <!-- Preview Image -->
                            <div class="flex items-center justify-center w-full h-full min-h-0 overflow-hidden">
                                {#if validUrl}
                                    <button 
                                        class="flex items-center justify-center w-full h-full min-h-0 overflow-hidden"
                                        on:click={(() => {
                                            popupStack.open({
                                                type: "image", 
                                                variant: "modal",
                                                imageUrl: urlInput, 
                                                imageName: urlInput, 
                                                imageAuthor: urlInput
                                            });
                                        })}
                                    >
                                        <img 
                                            src={urlInput}
                                            alt="Online Preview"
                                            class="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-xl block"
                                            in:fade={{ duration: 300 }}
                                            on:error={() => {/* optional: handle broken links */}}
                                        />
                                    </button>
                                {:else}
                                    <Iconify iconId="material-symbols-light:link-off-rounded" height={56} class="text-gray-300" />
                                {/if}
                            </div>
                        {/if}

                        <!-- Divider -->
                        <div class="w-full py-3 flex items-center text-xs text-gray-500 uppercase before:flex-1 before:border-t before:border-gray-500 before:me-6 after:flex-1 after:border-t after:border-gray-500 after:ms-6">Or</div>

                        <!-- Online -->
                        <div>
                            <span class="inline-flex justify-center items-center size-16">
                                <Iconify
                                    iconId="material-symbols-light:add-photo-alternate-outline-rounded"
                                    height={56}
                                />         
                            </span>

                            <div class="flex flex-wrap justify-center text-sm/6 text-gray-600">
                                <span class="pe-1 font-medium text-gray-800">
                                    Import from URL
                                </span>
                            </div>

                            <p class="mt-1 text-xs text-gray-400">
                                Paste a link to an image.
                            </p>


                            <div class="mt-5 flex items-center justify-center space-x-5">
                                <input 
                                    placeholder="https://example.com/image.jpg" 
                                    bind:value={urlInput} 
                                    on:keydown={(e) => e.key === 'Enter' && createOnlineWrapper()}
                                />
                                
                                <button class="defaultButton !m-0 transition-all duration-200" disabled={!validUrl || isFetchingOnlineImage} on:click={createOnlineWrapper}>
                                    Ok
                                </button>
                            </div>
                        </div>
                    </div>
                {/if}

                <!-- Data -->
                {#if wrappedFiles.length > 1 || true }
                    <div class="space-y-5 w-1/2 flex flex-col h-full">
                        <div class="flex-1 overflow-y-auto">
                            {#if wrappedFiles.length > 1}
                                <h2>Image Data ({previewIndex + 1} of {wrappedFiles.length})</h2>
                            {:else}
                                <h2>Image Data</h2>
                            {/if}

                            <hr />

                            {#if wrappedFiles.length > 0}   
                                <!-- Changable File Data -->
                                <div class="space-y-5 p-2">       
                                    <Tooltip fullWidth={true} text={"A short alternative name that displays if the image fails to load"}>
                                        <input bind:value={wrappedFiles[previewIndex].name} disabled={!wrappedFiles[previewIndex]} placeholder="Name" />
                                    </Tooltip>

                                    <Tooltip fullWidth={true} text={"A brief description of what the image contains for accessibility and context"}>
                                        <input bind:value={wrappedFiles[previewIndex].description} disabled={!wrappedFiles[previewIndex]} placeholder="Description" />
                                    </Tooltip>  

                                    <Tooltip fullWidth={true} text={"The original source of the image (photographer, website, or license info)"}>
                                        <input bind:value={wrappedFiles[previewIndex].source} disabled={!wrappedFiles[previewIndex]} placeholder="Source" />
                                    </Tooltip>  
                                </div>

                                <!-- Metadata -->
                                <div class="mt-5 p-2">

                                    <h3>Metadata</h3>
                                    <hr class="!mt-0" />

                                    <!-- Grid -->
                                    <div class="text-gray-600 text-sm grid grid-cols-2 gap-y-4 gap-x-2">

                                        <!-- File Size -->
                                        <div class="flex flex-row items-center justify-start text-left">
                                            <Iconify iconId={"material-symbols-light:image-outline-rounded"} height={20} />
                                            <p>
                                                File Size: 
                                                <span class="text-tertiary-500 font-bold">
                                                    {wrappedFiles[previewIndex].file?.size ? formatByte(wrappedFiles[previewIndex].file.size) : 'Remote'}
                                                </span>                                            
                                            </p>
                                        </div>

                                        <div class="flex flex-row items-center justify-start text-left">
                                            <Iconify iconId={"material-symbols-light:filter-outline-rounded"} height={20} />
                                            <p>
                                                Total Size: <span class="text-tertiary-500 font-bold">{formatByte(totalSize)}</span>
                                            </p>
                                        </div>

                                        <!-- Size -->
                                        <div class="flex flex-row items-center justify-start text-left">
                                            <Iconify iconId={"material-symbols-light:height-rounded"} height={20} />
                                            <p>
                                                Height: <span class="text-tertiary-500 font-bold">{`${wrappedFiles[previewIndex].height || "?"} Pixel`}</span>
                                            </p>
                                        </div>

                                        <div class="flex flex-row items-center justify-start text-left">
                                            <Iconify iconId={"material-symbols-light:width-rounded"} height={20} />
                                            <p>
                                                Width: <span class="text-tertiary-500 font-bold">{`${wrappedFiles[previewIndex].width || "?"} Pixel`}</span>
                                            </p>
                                        </div>

                                        <!-- Camera -->
                                        <div class="flex flex-row items-center justify-start text-left">
                                            <Iconify iconId={"material-symbols-light:photo-camera-outline-rounded"} height={20} />
                                            <p>
                                                Camera: <span class="text-tertiary-500 font-bold">{wrappedFiles[previewIndex].camera || "?"}</span>
                                            </p>
                                        </div>

                                        <div class="flex flex-row items-center justify-start text-left">
                                            <Iconify iconId={"material-symbols-light:camera"} height={20} />
                                            <p>
                                                ISO: <span class="text-tertiary-500 font-bold">{wrappedFiles[previewIndex].iso || "?"}</span>
                                            </p>
                                        </div>

                                        <!-- Date -->
                                        <div class="flex flex-row items-center justify-start text-left">
                                            <Iconify iconId={"material-symbols-light:calendar-today-outline-rounded"} height={20} />
                                            <p>
                                                Date: <span class="text-tertiary-500 font-bold">{wrappedFiles[previewIndex].dateTaken || "?"}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            {:else}
                                <p>Upload some Images to see and edit image data.</p>
                            {/if}
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center justify-center bottom-0 gap-x-5">
                            <button class="defaultButton !bg-error-default !mt-0" on:click={close}> 
                                Close
                            </button>

                            <button on:click={uploadFile} disabled={wrappedFiles.length === 0} class="defaultButton !mt-0">
                                Upload
                            </button>
                        </div>
                    </div>
                {/if}

            </div>
        </div>
    </div>  
{/if}


