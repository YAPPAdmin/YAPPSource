<script lang="ts">
    import { popupStack } from "$lib/popups/popup";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { fly, fade } from "svelte/transition";
    import { newBlogStack } from "./newBlogStore";
    import SmallGallery from "$lib/svelteComponents/display/Images/Selector/SmallGallery.svelte";
    import Image from "$lib/svelteComponents/display/Images/ImageCard.svelte"
    import { clickOutside } from "$lib/utils/util";
    import { invalidateAll } from "$app/navigation";
    import ImageCard from "$lib/svelteComponents/display/Images/ImageCard.svelte";

    $: current = $newBlogStack.at(-1);

    let isUploading: boolean = false;
    let isSelectingCoverImage: boolean = false;

    let titleInput: string = "";
    let descriptionInput: string = "";
    let titleImageIdInput: string | undefined = "";

    function close() {
        newBlogStack.close();
    }

    async function createNewBlog() {
        isUploading = true;

        try {
            const params = new URLSearchParams();
            if(titleInput) params.append("title", titleInput);
            if(descriptionInput) params.append("description", descriptionInput);
            if(titleImageIdInput) params.append("titleImageId", titleImageIdInput);

            const result = await fetch(`/api/blog?${params.toString()}`, {
                method: "POST"
            })

            if(!result.ok) throw new Error("Server Error");

            await invalidateAll();

            close();
            popupStack.open({
                title: "Created a new Blogpost",
                type: "text",
                variant: "toast",
                message: `Your blogpost ${titleInput} has been created successfully`,
            })

            titleInput = "";
            descriptionInput = "";
            titleImageIdInput = "";



        } catch(error) {
            console.error("Failed creating new blogpost", error)
            popupStack.open({
                title: "Failed to create a Blogpost",
                type: "text",
                variant: "toast",
                message: "Failed to create a new Blogpost"
            })
        } finally {
            isUploading = false;
        }
        
    }

</script>

<svelte:window on:keydown={((event) => event.key == "Escape" && close())} />
{#if current}
    <!-- <svelte:window on:keydown={(e) => e.key === 'Escape' && close()} /> -->
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-39" transition:fade>
        <div 
            class="w-1/2 h-2/3 flex flex-col rounded-2xl p-6 shadow-lg bg-white" 
            transition:fly={{ y: 20 }}
            use:clickOutside
            on:click_outside={close}
        >

            <h2>New Blog</h2>
            <hr />

            <!-- Blog Data -->
            <div class="flex flex-row w-full min-h-0">

                <!-- Cover Image -->
                <div class="w-1/2 min-h-0 flex flex-col p-2">
                    <div class="!mb-5">
                        <h3 class="!m-0">Cover Image</h3>
                        <p class="text-sm text-gray-500">You can change this later</p>
                    </div>

                    <!-- Cover Image -->
                    {#if titleImageIdInput && !isSelectingCoverImage}
                        <div class="relative w-2/3 min-h-0 aspect-square mx-auto group">
                            
                            <button
                                class="absolute -top-2 -right-2 z-10 p-1 bg-white text-gray-500 hover:text-red-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                                on:click|stopPropagation={() => {titleImageIdInput = undefined}}
                                title="Remove this image"
                            >
                                <Iconify iconId="material-symbols-light:cancel-outline-rounded" height={20} style={"color: red"} />
                            </button>
                            
                            <button class="overflow-hidden rounded-2xl w-full h-full block" on:click={() => {isSelectingCoverImage = true}}>
                                <ImageCard 
                                    src={titleImageIdInput}
                                />
                            </button>

                        </div>

                    <!-- Image Select -->
                    {:else}
                        <div class="w-full flex-1 min-h-0 flex flex-col items-center gap-4">
                            <SmallGallery 
                                selectedId={titleImageIdInput ? titleImageIdInput : ""}
                                on:select={(event) => {
                                    const file = event.detail;
                                    titleImageIdInput = file.id;
                                    isSelectingCoverImage = false;
                                }}
                            /> 
                        </div>
                        
                    {/if}
                </div>

                <!-- Blog Data -->
                <div class="w-1/2 space-y-5 p-2">
                    <div class="mb-5!">
                        <h3 class="m-0!">Blog Data</h3>
                        <p class="text-sm text-gray-500">You can change this later</p>
                    </div>

                    
                    <!-- Name/Description -->
                    <div class="space-y-2">
                        <Tooltip fullWidth={true} text={"The title of your blogpost"}>
                            <input bind:value={titleInput} placeholder="Name" />
                        </Tooltip>
                    
                        <Tooltip fullWidth={true} text={"The name of your blogpost"}>
                            <input bind:value={descriptionInput} placeholder="Description" />
                        </Tooltip>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="ml-auto space-x-1">
                <button class="defaultButton bg-error-default!" on:click={close}>
                    Cancel
                </button>

                <button class="defaultButton" on:click={createNewBlog} disabled={!titleInput || isUploading}>
                    Create
                </button>
            </div>

        </div>
    </div>  
{/if}


