<script lang="ts">
    import { fileUploadStack } from "$lib/uploads/upload";
    import { onMount } from "svelte";
    import { page } from "$app/state";
  import ImageCardEditor from "$lib/svelteComponents/display/Images/ImageCardEditor.svelte";

    let preloadRegistry = page.data.registry;

    let images: any[] = [];

    let searchId = "";
    let searchName = "";
    let searchSource = "";
    let isLoading = false;

    onMount(() => {
        fetchImages();
    });

    async function fetchImages() {
        try {
            isLoading = true;
            
            const params = new URLSearchParams();
            if (searchId) params.append("id", searchId);
            if (searchName) params.append("fileName", searchName);
            if (searchSource) params.append("source", searchSource);

            const result = await fetch(`/api/upload?${params.toString()}`, {
                method: "GET",
            });

            const data = await result.json();
            images = data.files || [];
        
        } catch(error) {
            console.error("Error fetching images: ", error);
        
        } finally {
            isLoading = false;
        }
    }




</script>

<div class="space-y-10">

    Images

    <div class="w-full h-100 space-y-5">

        <button 
            class="defaultButton"
            on:click={(() => fileUploadStack.open({            
                hasDescription: true,
                hasName: true,
                hasSource: true,
        }))}>
            POST
        </button>

        <div class="w-full h-full min-h-fit flex items-center justify-center">

            {#if isLoading}
                <div class="animate-spin inline-block size-8 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                    <span class="sr-only">Loading...</span>
                </div>
            {:else if images.length > 0}

                <div class="flex space-x-5">
                    {#each images as image }
                        <ImageCardEditor 
                            image={image}
                            on:delete={(event) => {
                                const id = event.detail.id;
                                images = images.filter(img => img.metadata.id != id)
                            }}
                        />
                    {/each}
                </div>
            {:else}
                <p>No Images</p>
            {/if}

        </div>

    </div>
</div>