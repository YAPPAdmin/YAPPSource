<script lang="ts">
    import { clickOutside } from "$lib/utils/util";
    import { fade, fly } from "svelte/transition";
    import { newVersionStack } from "./newVersionStore";
    import { BlogPost } from "../blog";
    import { onMount } from "svelte";

    $: current = $newVersionStack.at(-1);

    $: blogPost = current?.blogPost ? BlogPost.fromDbRecord(current.blogPost) : null;
    $: baseVersionId = current?.baseVersionId;
    $: baseMode = baseVersionId ? "version" : "post";
    $: selectedDropdownVersionId = baseVersionId || "";

    let title = "";
    let description = "";

    function close() {
        title = "";
        description = "";
        blogPost = null;
        baseVersionId = "";
        baseMode = "";
        selectedDropdownVersionId = ""; 

        newVersionStack.close();
    }

    function updateBase() {
        if(!blogPost) return;

        // Fill from BlogPost
        if(selectedDropdownVersionId == "original") {
            title = `Copy of ${blogPost.title}` || "";
            description = `(Copy) ${blogPost.description}` || "";
        } else {
            const baseVersionObject = blogPost.getVersion(selectedDropdownVersionId);

            if(baseVersionObject?.EditorData) {
                title = `Copy of ${baseVersionObject.EditorData.title}` || "";
                description = `(Copy) ${baseVersionObject.EditorData.description}` || "";
            }
        }
    }

    async function createNewVersion() {
        if(!blogPost) {
            console.error("Missing blogpost");
            return;
        }

        const params = new URLSearchParams({
            baseBlogPostId: blogPost.id,
            versionTitle: title,
            versionDescr: description,
        })

        if(baseMode == "version" && selectedDropdownVersionId) {
            params.append("baseVersionId", selectedDropdownVersionId)
        }

        try {
            const response = await fetch(`/api/blog/version?${params.toString()}`, {
                method: "POST",
            })

            if(response.ok) {
                const result = await response.json();
                console.log("SUCCESS: ", result);
                close();
            } else {
                const errorData = await response.json();
                console.error("API ERROR: ", errorData.error);
            }
        }catch(error) {
            console.error("ERROR: ", error)
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

            <h2>New Version</h2>
            <hr />

            <div class="space-y-4">
                
                <div class="pl-6" transition:fade={{ duration: 150 }}>
                    <label for="selectedDropdown" class="block text-sm font-medium text-gray-700 mb-1">Selected Base</label>
                    <select 
                        id="selectedDropdown"
                        bind:value={selectedDropdownVersionId}
                        on:change={updateBase}
                        class="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="" disabled>Select a version...</option>
                        <option value="original">Use original Blogpost</option>
                        {#if blogPost?.versions}
                            {#each blogPost.versions as version}
                                <option value={version.id}>
                                    <p class="space-x-2">
                                        <span class="!text-gray-500">{version.versionNumber} - </span> {version.versionData?.title || version.id} 
                                    </p>

                                    {version.id === baseVersionId ? "(Copied)" : ""}
                                </option>
                            {/each}
                        {/if}
                    </select>
                </div>

                <hr class="my-4" />

                <div class="space-y-3">
                    <div>
                        <label for="versionTitle" class="block text-sm font-medium text-gray-700 mb-1">Version Title</label>
                        <input id="versionTitle" type="text" bind:value={title} placeholder="e.g., Draft 2, Summer Update..." class="w-full p-2 border border-gray-300 rounded-md" />
                    </div>

                    <div>
                        <label for="versionDescr" class="block text-sm font-medium text-gray-700 mb-1">Version Description</label>
                        <textarea id="versionDescr" bind:value={description} rows="2" placeholder="What is this version for?" class="w-full p-2 border border-gray-300 rounded-md"></textarea>
                    </div>
                </div>
            </div>

            <div class="mb-0 flex justify-end gap-3">
                <button on:click={close} class="defaultButton !bg-error-default hover:!bg-error-light">
                    Cancel
                </button>
                
                <button on:click={createNewVersion} class="defaultButton" disabled={!title || !selectedDropdownVersionId}>
                    Create Version
                </button>
            </div>

        </div>
    </div>  
{/if}