<script lang="ts">
    import { page } from "$app/state";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { onMount, tick } from "svelte";
    import { formatDate, formatTime } from "$lib/utils/util";
    import Tiptap from "$lib/svelteComponents/tiptap/Tiptap.svelte";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import { BlogPostN, type BlogPostVersion } from "$lib/utils/blog";
    import { User } from "$lib/utils/auth/User";
    import { popupStack } from "$lib/popups/popup";
    import VersionCard from "$lib/svelteComponents/blog/VersionCard.svelte";

    const AUTO_SAVE_DEBOUNCE = 2000; 
    const AUTO_SAVE_MAX_INTERVAL = 10000;

    let autoSaveTimer: NodeJS.Timeout | null = null;
    let autoSaveInterval: NodeJS.Timeout | null = null;

    let blogpost: BlogPostN | null;
    let authorCache: any[] = [];
	let user = page.data.session.user

    let editorContent: any;
    let isEditing: boolean = false;


    let selectedVersion: BlogPostVersion | undefined = undefined;
    let editVersion: BlogPostVersion | undefined = undefined;

    let hasUnsavedChanges: boolean = false;
    let currentlySendingSave: boolean = false; // UI tracker for saving status

    let autosaveEnabled: boolean = true;

    async function getAuthorInfo(id: string) {
        const fullAuthorId = id.startsWith("user:") ? id : `user:${id}`;

        // Check if the author info is already in the cache
        const cacheAuthor = authorCache.find((author) => author.id === fullAuthorId)

        if(cacheAuthor) {
            return cacheAuthor
        }

        console.log("Fetching author info for ID:", id);
        const url = `/api/getUser?userRequest=author&id=${encodeURIComponent(id)}`;
        const result = await fetch(url);

        if (!result.ok) {
            console.log("Failed fetching Author info for ID:", id);
            const noAuthor = {
                id: id,
                name: "Author not found",
                image: null,
                email: "Email not found",
            };

            return noAuthor;

        } else {
            const data = await result.json();
            const user = data.user;

            const formatedUser = User.fromJSON(user)

            authorCache.push(formatedUser); // Cache the fetched user info
            return formatedUser;
        }
    }


    function handleTipTapUpdate(event: CustomEvent) {
        editorContent = event.detail.content;
        
        // Detect changes between editor and version
        detectChanges();
    }

    onMount(() => {
        if (!(user instanceof User)) {
            user = User.fromJSON(user);
        }
        // Load and generate BlogPost Object
        blogpost = BlogPostN.fromJSON(page.data.post);

        if(!blogpost) return;
       
        blogpost.sortVersionsNewToOld()

        // Load Cache
        authorCache = page.data.authorCache;

        const activeVersion = blogpost.getActiveVersion()

        if(!activeVersion) return;

        loadVersion(activeVersion.id)
    })


    async function loadVersion(versionId: string) {
        // Dont switch versions while editing
        if(isEditing) return;

        const found = blogpost?.getVersionById(versionId);

        // Reset selectedVersion
        selectedVersion = undefined;
        
        // Svelte Tick to force reactivity
        await tick();

        // Set Versions
        selectedVersion = found ? structuredClone(found) : undefined;
        editVersion = selectedVersion ? structuredClone(selectedVersion) : undefined;
        editorContent = selectedVersion?.content || "";

        console.log("Changed to version ", selectedVersion?.versionNumber)
    }

    async function addNewVersion() {
        isEditing = true;

        const newVersion = BlogPostN.createDraftVersion(user?.id, selectedVersion, blogpost);

        // Add to local state for Svelte reactivity
        blogpost.versions = [...blogpost.versions, newVersion];

        loadVersion(newVersion.id)
        selectedVersion = newVersion;
        editVersion = newVersion;
        editorContent = newVersion.content;

        // Save changes to backend
        await saveChanges(newVersion);
    }

    async function deleteVersion(versionId: string) {
        currentlySendingSave = true;

        if (!blogpost || !blogpost.versions || !versionId) return;

        const deleteVersion = blogpost.versions.find(version => version.id == versionId)

        if(!deleteVersion) return;

        try {
            const result = await fetch("/api/blog", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    blogPostId: blogpost.id,
                    versionId: versionId,
                })
            })

            const updateBody = await result.json();

            if (updateBody.updatedBlog) {
                blogpost = BlogPostN.fromJSON(updateBody.updatedBlog);

                selectedVersion = undefined;
                editVersion = undefined;
                editorContent = undefined;

                popupStack.open({
                    type: "text",
                    title: "Version deleted",
                    message: `Successfully deleted Version ${deleteVersion.versionTitle} - ${deleteVersion.id}` 
                })

            }

        } catch (err) {
            console.error("Deleting Version falied: ", err);
        } finally {
            currentlySendingSave = false;
        }

    }

    // Reactively run change detection whenever title changes 
    $: if (isEditing && editVersion && !currentlySendingSave) {
        detectChanges();
    }

    function normalize(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(normalize);
        } else if (obj && typeof obj === "object") {
            return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = normalize(obj[key]);
                return acc;
            }, {} as any);
        }
        return obj;
    }

    // Detect if the user had made changes to the viewd version
    function detectChanges() {
        if (currentlySendingSave) return;
        if (!selectedVersion || !editVersion) return;

        const currentContent = JSON.stringify(normalize(editorContent));
        const savedContent   = JSON.stringify(normalize(selectedVersion.content));

        if (currentContent !== savedContent) {
            console.log("CONTENT CHANGES")
            hasUnsavedChanges = true;
            scheduleAutoSave();
            return;
        }

        // Compare Version Title
        if (selectedVersion.versionTitle !== editVersion.versionTitle) {
            console.log("VERSION TITLE CHANGES")
            hasUnsavedChanges = true;
            scheduleAutoSave();
            return;
        }

        // Compare Version Description
        if (selectedVersion.versionDescription !== editVersion.versionDescription) {
            console.log("VERSION DESCRIPTION CHANGES")
            hasUnsavedChanges = true;
            scheduleAutoSave();
            return;
        }

        // Compare title
        if(selectedVersion.title !== editVersion.title) {
            console.log("TITLE CHANGES")
            hasUnsavedChanges = true;
            scheduleAutoSave();
            return;
        }

        if(selectedVersion.description !== editVersion.description) {
            console.log("DESCRIPTION CHANGES")
            hasUnsavedChanges = true;
            scheduleAutoSave();
            return;
        }

        hasUnsavedChanges = false;
    }

    function scheduleAutoSave() {

        if(!autosaveEnabled) return;

        console.log("SCHEDULE AUTO SAVE")
        // Clear pause typing timer
        if(autoSaveTimer) {
            clearTimeout(autoSaveTimer)
        }

        // Start debounce
        autoSaveTimer = setTimeout(() => {
            saveChanges();
        }, AUTO_SAVE_DEBOUNCE)

        // Start interval if needed
        if(!autoSaveInterval) {
            autoSaveInterval = setInterval(() => {
                saveChanges();
            }, AUTO_SAVE_MAX_INTERVAL)
        }
    }
 
    async function saveChanges(versionToSave?: BlogPostVersion) {
        currentlySendingSave = true;

        try {
            const version = versionToSave || editVersion;
            if (!version) return;

            // Load editor content into the version to save
            version.content = editorContent;

            // Decide whether its a new version or existing
            const payload = version.id && blogpost.versions.some(v => v.id === version.id)
                ? { updateVersion: version }
                : { createVersion: version };

            const result = await fetch("/api/blog", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const updateBody = await result.json();

            if (updateBody.updatedBlog) {
                blogpost = BlogPostN.fromJSON(updateBody.updatedBlog);

                const updatedVersion = blogpost.getVersionById(version.id);
                if (updatedVersion) {
                    selectedVersion = structuredClone(updatedVersion);
                    editVersion = structuredClone(updatedVersion);
                    editorContent = updatedVersion.content;
                }
            } else {
                console.error("Error setting updated blogpost");
            }
        } catch (err) {
            console.error("AUTO-SAVE FAILED: ", err);
        } finally {
            currentlySendingSave = false;

            if (autoSaveInterval) {
                clearInterval(autoSaveInterval);
                autoSaveInterval = null;
            }
        }
    }

    function startEditing() {
        isEditing = true;

        if(!user || !user.id || !blogpost) return;

        // Create a deep clone of selectedVersion so not to edit selectedVersion direclty
        editVersion = JSON.parse(JSON.stringify(selectedVersion));

        console.log("Start Editing")
    }

    function stopEditing() {
        saveChanges();
        isEditing = false;
        editVersion = undefined;

        console.log("End Editing");
    }

</script>



{#if blogpost && user instanceof User}

<div class="h-screen p-8">

    <!-- Heading -->
    <div class="w-full flex items-center justify-between space-x-3">
        <div>
            <!-- Heading -->
            {#if blogpost}
                <div class="flex items-center">
                    <Tooltip text={`BlogID ${blogpost.id}`}>
                        {#if selectedVersion}
                            <input
                                type="text"
                                class="!text-primary-500 !text-4xl !px-0 !mb-2 w-full bg-transparent border-none p-0 leading-tight py-1" placeholder="Blog Post Title"
                                bind:value={selectedVersion.title}
                            />
                            <p>{selectedVersion.versionTitle}</p>
                        {:else}
                            <h1 class="!mb-2">{blogpost.title}</h1>
                        {/if}
                        
                    </Tooltip>
                    
                </div>

                <div class="flex items-center">
                    <Iconify iconId={"material-symbols-light:calendar-clock-outline-rounded"} height={18} inline={true}/>
                    {#if blogpost.publicDate}
                        <p class="text-sm !text-gray-500">{formatDate(blogpost.publicDate)}</p>
                    {/if}

                    <span class="hidden">
                        {#await getAuthorInfo(blogpost.authorId)}
                            <span class="animate-pulse w-full h-4 bg-gray-200 rounded-full" />
                        {:then author}
                            <div class="ml-2 flex items-center">
                                <img class="shrink-0 size-4 rounded-full" src={author.image} alt={author.username}>
                                <p>{author.username}</p>
                            </div>
                        {:catch error}
                            <span>Error loading author</span>
                        {/await}
                    </span>
                </div> 

            
            <!-- Heading Skeleton -->
            {:else}
                <div class="flex items-center animate-pulse">
                    <h1 class="!mb-2 bg-gray-200 rounded-full w-80 h-8">&nbsp;</h1>
                </div>

                <div class="flex items-center animate-pulse">
                    <span class="animate-pulse w-64 h-4 bg-gray-200  rounded-full" />

                </div> 
            {/if}
        </div>
    </div>

    <hr class="!border mb-8">

    <!-- Grid -->
    <div class="flex w-full space-x-2 mb-10">

        <!-- BLog Editor -->
        <div class={isEditing ? "rounded-xl h-fit flex-1 p-2.5 tape" : "rounded-xl h-fit flex-1 p-2.5"}> 
            <Tiptap on:change={handleTipTapUpdate} content={editorContent} isEditable={isEditing}/>
        </div>

        <!-- Right Side -->
        {#if blogpost}
            <div class="w-1/6 p-4 mr-4  space-y-4 items-center">

                <!-- Active Version -->
                <div class="">
                    {#if selectedVersion}
                        <!-- Heading -->
                        <div class="flex flex-row items-center">
                            {#if isEditing} <!-- Edit  Header-->
                                <h3>Currently <strong class="!text-warning-default">Editing</strong></h3>
                            
                                <!-- Start Editing Button -->
                                <button on:click={stopEditing} class="inline-flex items-center justify-center align-middle">
                                    <Tooltip text={"Stop editing this Version"}>
                                        <Iconify iconId={"material-symbols-light:cancel-outline-rounded"} button={true} />
                                    </Tooltip>
                                </button>
                            {:else} <!-- View Header-->
                                <h3>Currently <strong class="!text-success-default">Viewing</strong></h3>
                            
                                <!-- Start Editing Button -->
                                <button on:click={startEditing} class="inline-flex items-center justify-center align-middle">
                                    <Tooltip text={"Start editing this Version"}>
                                        <Iconify iconId={"material-symbols-light:edit-outline-rounded"} button={true} />
                                    </Tooltip>
                                </button>
                            {/if}
                        </div>

                        {#if isEditing && editVersion} <!-- Edit Mode -->
                            <!-- Version Info -->

                            <div class="tape p-2 rounded mb-8">
                                <div class="grow p-2 bg-gray-100 hover:bg-gray-200 rounded ">
                                    <h3 class="flex !text-base !mt-0 gap-x-1.5 font-semibold text-gray-800 ">
                                        <div class="flex items-center gap-x-1.5">
                                            
                                            <Tooltip text={`Version Number ${editVersion.versionNumber}`}>
                                                <p class="!text-primary-500 text-sm">{editVersion.versionNumber}</p>
                                            </Tooltip>

                                            <p class="!text-gray-500 text-sm">-</p>

                                            <Tooltip text={`Updated at ${formatTime(editVersion.updatedAt)} - ${formatDate(editVersion.updatedAt)}` }>
                                                <p class="!text-gray-500 text-sm">{formatTime(editVersion.updatedAt)}</p>
                                            </Tooltip> 

                                            <Tooltip text={"Edit the Title of this specific version"}>
                                                <input bind:value={editVersion.versionTitle} class="truncate block w-full rounded-lg sm:text-sm bg-transparent border-transparent focus:border-green-400 focus:ring-0 hover:border-green-300 " />
                                            </Tooltip>

                                            <Tooltip text="Delete this Version">
                                                <button on:click={() => {
                                                    popupStack.open({
                                                        type: "text",
                                                        title: "Delete Version",
                                                        message: "Are you sure you want to delete this version? This action cannot be undone.",
                                                        buttons: [{ label: "DELETE", action: () => deleteVersion(editVersion.id) }],
                                                        variant: "modal",
                                                        closeText: "Cancel"
                                                    });
                                                }}>
                                                    <Iconify iconId="material-symbols-light:delete-outline-rounded" button={true}/>
                                                </button>
                                            </Tooltip>

                                        </div>
                                    </h3>

                                    <!-- Details -->
                                    <div class="">
                                        <div class="max-w-sm space-y-3">
                                            <textarea bind:value={editVersion.versionDescription} class="p-1.5 sm:py-3 sm:px-4 block w-full border-2 border-gray-300 rounded-lg sm:text-sm " rows="3" placeholder="Version Description"></textarea>
                                        </div>

                                        <!-- Author -->
                                        <button type="button" class="mt-1 -ms-1 p-1 inline-flex items-center gap-x-2 text-xs rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none ">

                                            {#await getAuthorInfo(editVersion.authorId)}
                                                <span class="animate-pulse w-full h-4 bg-gray-200 rounded-full dark:bg-neutral-700" />
                                            {:then author}
                                            
                                                <img class="shrink-0 size-4 rounded-full" src={author.image} alt={author.username}>
                                                <span>{author.username}</span>

                                            {:catch error}
                                                <span>Error loading author</span>
                                            {/await}

                                        </button>

                                    </div>

                                    <div class="flex items-center justify-between">
                                        <!-- Unsaved changes -->
                                        <div>

                                            {#if currentlySendingSave} <!-- Currently Sending State -->
                                            
                                                <Tooltip text={"Saving changes ..."}>
                                                    <div class="inline-flex items-center">
                                                        <span class="size-2 inline-block bg-warning-default rounded-full me-2"></span>
                                                        <span class="text-gray-600 ">Saving ...</span>
                                                    </div>
                                                </Tooltip>

                                            {:else if hasUnsavedChanges} <!-- Unsaved changes State -->

                                                <Tooltip text={"This draft currently has unsaved changes!"}>
                                                    <div class="inline-flex items-center">
                                                        <span class="size-2 inline-block bg-error-default rounded-full me-2"></span>
                                                        <span class="text-gray-600 ">Unsaved Changes</span>
                                                    </div>
                                                </Tooltip>

                                            {:else} <!-- No unsaved changes State -->

                                                <Tooltip text={"Everythings up to date!"}>
                                                    <div class="inline-flex items-center">
                                                        <span class="size-2 inline-block bg-success-default rounded-full me-2"></span>
                                                        <span class="text-gray-600 ">Saved</span>
                                                    </div>
                                                </Tooltip>

                                            {/if}

                                        </div>

                                        <!-- Manual Saving -->
                                        <div>
                                            {#if !autosaveEnabled}
                                                <Tooltip text={"Save"}>
                                                    <button on:click={saveChanges}>
                                                        <Iconify iconId={"material-symbols-light:save-outline-rounded"} button={true} />
                                                    </button>
                                                </Tooltip>
                                            {/if}
                                        </div>
                                    </div>

                                </div>
                            </div>


                        
                        {:else} <!-- Read Only Mode -->
                            <div>
                                <!-- Version Info -->
                                <div class="p-2 rounded mb-8">
                                    <div class="grow p-2 bg-gray-100 hover:bg-gray-200 rounded ">
                                    <h3 class="flex !text-base !mt-0 gap-x-1.5 font-semibold text-gray-800 ">
                                        <div class="flex items-center gap-x-1.5">
                                            
                                            <Tooltip text={`Version Number ${selectedVersion.versionNumber}`}>
                                                <p class="!text-primary-500 text-sm">{selectedVersion.versionNumber}</p>
                                            </Tooltip>

                                            <p class="!text-gray-500 text-sm">-</p>

                                            <Tooltip text={`Updated at ${formatTime(selectedVersion.updatedAt)}` }>
                                                <p class="!text-gray-500 text-sm">{formatTime(selectedVersion.updatedAt)}</p>
                                            </Tooltip>

                                            {#if selectedVersion.versionTitle}
                                                {selectedVersion.versionTitle}
                                            {:else}
                                                <span class="italic">No Version Title</span>
                                            {/if}
                                        </div>
                                    </h3>

                                    <!-- Details -->
                                    <div class="pl-2">
                                        <p class="mt-1 !text-sm text-gray-600 ">
                                            {#if selectedVersion.versionDescription}
                                                {selectedVersion.versionDescription}
                                            {:else}
                                                <span class="italic">No Version Description</span>
                                            {/if}
                                        </p>

                                        <!-- Author -->
                                        <button type="button" class="mt-1 -ms-1 p-1 inline-flex items-center gap-x-2 text-xs rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none ">

                                            {#await getAuthorInfo(selectedVersion.authorId)}
                                                <span class="animate-pulse w-full h-4 bg-gray-200 rounded-full dark:bg-neutral-700" />
                                            {:then author}
                                            
                                                <img class="shrink-0 size-4 rounded-full" src={author.image} alt={author.username}>
                                                <span>{author.username}</span>

                                            {:catch error}
                                                <span>Error loading author</span>
                                            {/await}

                                        </button>

                                    </div>
                                    </div>
                                </div>
                    

                            </div>  
                        {/if}
                    {/if}
                </div>

                <!-- History -->
                <div>
                    <!-- Heading -->
                    <div class="flex flex-row items-center w-full">
                        <h3>All Versions</h3>

                        <div class="ml-auto gap-x-0.5 flex flex-row items-center">
                            <Tooltip text={""}>
                                <button>
                                    <Iconify iconId={"material-symbols-light:filter-alt-outline"} button={true} />
                                </button>
                            </Tooltip>

                            <Tooltip text={"Add new Version"}>
                                <button on:click={addNewVersion}>
                                    <Iconify iconId={"material-symbols-light:add-rounded"} button={true} />
                                </button>
                            </Tooltip>                                            
                        </div>
                    </div>

                    <!-- Version List -->
                    <div class="max-h-96 overflow-y-scroll">
                        {#if blogpost.versions}
                            {#each blogpost.groupByDate() as [date, versions]}
                                <!-- Date Block -->
                                <div>
                                    <!-- Heading -->
                                    <div class="ps-2 my-2 first:mt-0">
                                        <h2 class="!text-xs font-medium uppercase text-gray-500 ">
                                            {formatDate(date)}
                                        </h2>
                                    </div>

                                    {#each versions as version (version.id)}

                                        <!-- Item -->
                                        <div class="flex gap-x-1">
                                            <!-- Icon -->
                                            <div class="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 ">
                                                <div class="relative z-10 size-7 flex justify-center items-center">
                                                    {#if version.active}
                                                        <Tooltip text={"This is the main active Version"}>
                                                            <a href={"/"}>
                                                                <Iconify iconId={"material-symbols-light:crown-outline-rounded"} button={true} />
                                                            </a>
                                                        </Tooltip>
                                                    {:else if version.public}
                                                        <Tooltip text={"This is an older but still public Version"}>
                                                            <a href={"/"}>
                                                                <Iconify iconId={"material-symbols-light:globe"} button={true} />
                                                            </a>
                                                        </Tooltip>
                                                    {:else}
                                                        <div class="size-2 rounded-full bg-gray-400 "></div>
                                                    {/if}


                                                </div>
                                            </div>

                                            <button on:click={() => loadVersion(version.id)}>
                                                <VersionCard version={version}/>
                                            </button>

                                        </div>
                                    {/each}
                                </div>  
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
        {/if}


    </div>
</div>    
{/if}







