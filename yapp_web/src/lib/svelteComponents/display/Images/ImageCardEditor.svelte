<script lang="ts">
    import { popupStack } from "$lib/popups/popup";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { Duration } from "surrealdb";
    import { fade, scale, slide } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let image;

    let originalImage = JSON.parse(JSON.stringify(image));

    let showDetails = false;
    let hovering = false;
    let isUpdating = false;

    $: hasChanges = image.metadata.description != originalImage.metadata.description || image.metadata.source != originalImage.metadata.source || image.metadata.name != originalImage.metadata.name

    async function updateImage() {
        if(isUpdating) return;
        isUpdating = true;

        const payload = {
            id: image.metadata.id,
            name: image.metadata.name,
            description: image.metadata.description,
            source: image.metadata.source,
        }

        const result = await fetch("/api/upload", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!result.ok) {
            popupStack.open({
                title: "Update Failed",
                message: "Image metadata could not be updated.",
                variant: "toast",
                type: "text"
            });
            isUpdating = false;
            return;
        }
        popupStack.open({
            title: "Updated",
            message: "Image metadata saved successfully.",
            variant: "toast",
            type: "text"
        });

        // Overwrite original values, so reset disappears
        originalImage = JSON.parse(JSON.stringify(image));

        dispatch("update", { id: image.metadata.id });

        isUpdating = false;
    }

    async function deleteImage() {
        const result = await fetch(`/api/upload?id=${image.metadata.id}`, {
            method: "DELETE"
        });

        if(!result.ok) {
            popupStack.open({
                title: "Error deleting Image",
                message: "Deleting that image did not work",
                variant: "toast",
                type: "text",
            })
        }

        dispatch("delete", { id: image.metadata.id })
    }

</script>

<div 
    role="group"
    on:focusin={() => hovering = true}
    on:focusout={() => hovering = false}
    on:mouseenter={() => hovering = true}
    on:mouseleave={() => hovering = false}
    class="h-fit flex flex-col bg-white border border-gray-200 shadow-md rounded-xl w-96 transform transition-transform duration-200 hover:scale-102">

    {#if hovering}
        <button
            on:click={deleteImage}
            class="absolute cursor-pointer top-2 right-2 bg-error-default text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-error-light transition"
            transition:scale={{ duration: 120 }}
        >
            <Iconify iconId={"material-symbols-light:delete-outline-rounded"} style={"color: white"} />
        </button>
    {/if}

    <!-- Image container with fixed size -->
    <div class="w-full h-40 bg-gray-100 overflow-hidden rounded-t-xl flex items-center justify-center">
        <img
            src={image.metadata.fileUrl}
            alt={image.metadata.name}
            class="w-full h-full object-contain"
        />
    </div>

    <!-- Content -->
    <div class="p-4 md:p-5">
        <input class="!text-lg !p-0 !border-none !text-secondary-500 mb-2 font-bold" bind:value={image.metadata.name} placeholder="Source" />


        <div class="mt-5 my-2 space-y-2">
            <input class="!font-sm" bind:value={image.metadata.description} placeholder="Description" />
        
            <input bind:value={image.metadata.source} placeholder="Source" />
        </div>

        <button on:click={(() => showDetails = !showDetails)}>
            {showDetails ? "Hide Details" : "Show Details"}
        </button>

        {#if showDetails}
            <div class="" transition:slide={{ duration: 200 }}>
                <p>Details</p>
                <p>Details</p>
                <p>Details</p>
            </div>    
        {/if}

        <div class="flex justify-end space-x-2 mt-4">
            {#if hasChanges}
                <Tooltip text={"Reset Changes"}>
                    <button transition:scale={{ duration: 200 }} on:click={(() => image = JSON.parse(JSON.stringify(originalImage)))} class="defaultButton">Reset</button>
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
