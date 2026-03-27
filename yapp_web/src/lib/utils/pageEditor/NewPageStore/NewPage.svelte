<script lang="ts">
    import { clickOutside } from "$lib/utils/util";
    import { fade, fly } from "svelte/transition";
    import { newPageStack } from "./newPageStore";
    import SmallGallery from "$lib/svelteComponents/display/Images/Selector/SmallGallery.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import ImageCard from "$lib/svelteComponents/display/Images/ImageCard.svelte";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import { popupStack } from "$lib/popups/popup";
    import { invalidateAll } from "$app/navigation";
  import { onMount } from "svelte";

    $: current = $newPageStack.at(-1);

    let isUploading: boolean = false;
    let isSelectingCoverImage: boolean = false;

    let titleInput: string = "";
    let descriptionInput: string = "";
    let urlInput: string = "";
    let titleImageIdInput: string | undefined = "";

    onMount(() => {
        console.log("Current: ", current)
    })

    function close() {
        newPageStack.close()
    }

    async function createNewPage() {
        isUploading = true;

        try {
            const payload = {
                title: titleInput || undefined,
                description: descriptionInput || undefined,
                titleImageId: titleImageIdInput || undefined,
                url: urlInput ? urlInput.toLowerCase().replace(/\s+/g, '-') : undefined,
            }

            const result = await fetch(`/api/webpage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if(!result.ok) throw new Error("Server Error");

            await invalidateAll();

            close();
            popupStack.open({
                title: "Created a new Webpage",
                type: "text",
                variant: "toast",
                message: `Your page ${titleInput} has been created successfully`,
            })

            titleInput = "";
            descriptionInput = "";
            titleImageIdInput = "";
            urlInput = "";
            
        } catch(error) {
            console.error("Failed creating new webpage", error)
            popupStack.open({
                title: "Failed to create a Webpage",
                type: "text",
                variant: "toast",
                message: "Failed to create a new Webpage"
            })
        } finally {
            isUploading = false;
        }
    }

</script>

<svelte:window on:keydown={((event) => event.key == "Escape" && close())} />
{#if current}
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-39" transition:fade>
        <div 
            class="w-1/2 h-2/3 flex flex-col rounded-2xl p-6 shadow-lg bg-white" 
            transition:fly={{ y: 20 }}
            use:clickOutside
            on:click_outside={close}
        >
            <h2>New Page</h2>
            <hr />

            <!-- Page Data -->
            <div class="flex flex-row w-full min-h-0">

                <!-- Cover Image -->
                <div class="w-1/2 min-h-0 flex flex-col p-2">
                    <div class="mb-5!">
                        <h3 class="m-0!">Cover Image</h3>
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
                                    console.log("SELECT: ", file)

                                    titleImageIdInput = file.id;
                                    isSelectingCoverImage = false;
                                }}
                            /> 
                        </div>
                    {/if}
                </div>

                <!-- Page Data -->
                <div class="w-1/2 space-y-5 p-2">
                    <div class="mb-5!">
                        <h3 class="m-0!">Blog Data</h3>
                        <p class="text-sm text-gray-500">You can change this later</p>
                    </div>

                    
                    <!-- Name/Description -->
                    <div class="space-y-2">
                        <Tooltip fullWidth={true} text={"The title of your page"}>
                            <input bind:value={titleInput} placeholder="Name" />
                        </Tooltip>
                    
                        <Tooltip fullWidth={true} text={"The Description of this page"}>
                            <input bind:value={descriptionInput} placeholder="Description" />
                        </Tooltip>

                        <Tooltip fullWidth={true} text={"The URL of your page"}>
                            <input bind:value={urlInput} placeholder="/your/page/" />
                        </Tooltip>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="ml-auto space-x-1">
                <button class="defaultButton bg-error-default!" on:click={close}>
                    Cancel
                </button>

                <button class="defaultButton" on:click={createNewPage} disabled={!titleInput || isUploading}>
                    Create
                </button>
            </div>

        </div>
    </div>
{/if}