<script lang="ts">
    import { page } from "$app/state";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { onDestroy, onMount, tick } from "svelte";
    import { formatDate, formatTime } from "$lib/utils/util";
    import Tiptap from "$lib/svelteComponents/tiptap/Tiptap.svelte";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import { BlogPost } from "$lib/utils/blog/blog";
    import { BlogPostVersion, type ChangeLogEntry, type Revision, type VersionDraft } from "$lib/utils/blog/blogversion";
    import { User } from "$lib/utils/auth/User";
    import { popupStack } from "$lib/popups/popup";
    import VersionCard from "$lib/svelteComponents/blog/editor/versions/VersionCard.svelte";
    import { fade, slide } from "svelte/transition";
    import { newVersionStack } from "$lib/utils/blog/NewVersionStore/newVersionStore";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import Differences from "$lib/svelteComponents/blog/editor/components/Differences.svelte";
    import { browser } from "$app/environment";
    import * as EditorActions from "$lib/utils/blog/editorActions"
    import SideBar from "$lib/svelteComponents/blog/editor/editorComponents/SideBar.svelte";
    import CurrentVersion from "$lib/svelteComponents/blog/editor/components/CurrentVersion.svelte";
    import VersionManagement from "$lib/svelteComponents/blog/editor/components/VersionManagement.svelte";
    import SaveActions from "$lib/svelteComponents/blog/editor/components/SaveActions.svelte";
    import ViewerActions from "$lib/svelteComponents/blog/editor/components/ViewerActions.svelte";
    import Metadata from "$lib/svelteComponents/blog/editor/components/Metadata.svelte";
    import ToC from "$lib/svelteComponents/blog/editor/components/ToC.svelte";
    import NodeEditor from "$lib/svelteComponents/blog/editor/components/NodeEditor/NodeEditor.svelte";
    import History from "$lib/svelteComponents/blog/editor/components/History.svelte";
    import StatusManagement from "$lib/svelteComponents/blog/editor/components/StatusManagement.svelte";

    const pageData = page.data

    const TIMEOUT: number = 3000;
    let SESSION_KEY: string = "";

    let blogPost: BlogPost | undefined;
	const rawUser = page.data.user
    let user: User | undefined = rawUser ? User.fromJSON(rawUser) : undefined;

    let editorInstance: any;
    let editorContent: any;
    let error: "404" | string = "";

    let saveTimeout: ReturnType<typeof setTimeout>;

    let changeMessage = "";

    //#region States
    let isEditing: boolean = false;
    let isSavingDraft: boolean = false;
    let isSavingCommit: boolean = false;
    let hasUnsavedChanges: boolean = false;
    //#endregion

    //#region UI Vars
    const showVersionManagement = persistedStore("ui_version_mgmt_open", true);
    const showEditorTools = persistedStore("ui_showEditorTools", true);
    const showDescription = persistedStore("ui_showDescription", true);
    //#endregion

    let selectedVersion: BlogPostVersion | undefined;
    let selectedDraft: VersionDraft | undefined;

    onMount(async () => {
        if (!pageData.blogPost || !user) { error = "404"; return; }
        
        $showVersionManagement = true;

        blogPost = BlogPost.fromDbRecord(pageData.blogPost);
        if(!blogPost) { error = "404"; return; };

        const sessionState = EditorActions.loadLocalSession(blogPost.id);

        if(sessionState?.versionId) {
            selectedVersion = blogPost.getVersion(sessionState.versionId) || blogPost.getVersion("latest");
        } else {
            selectedVersion = blogPost.getVersion(blogPost.currentVersion || "");
        }

        if(sessionState?.isEditing) {
            await startEditing(true);
        } else {
            editorContent = selectedVersion?.versionData.content || "";
        }
    })

    onDestroy(() => {
        if (saveTimeout) clearTimeout(saveTimeout);
        if (browser && blogPost) {
            EditorActions.saveLocalSession(blogPost.id, selectedVersion?.id || "", isEditing);
        }
    });

    async function loadVersion(versionId: string) {
        console.log("LoadVersion\n", blogPost)
        if(!blogPost || !user?.getId()) return;

        if (isEditing) {
            popupStack.open({
                title: "Unsaved Changes",
                message: "Please save or cancel your current draft before loading a different version.",
                type: "text",
                variant: "toast"
            });
            return;
        }

        // Get Version
        const found = blogPost.getVersion(versionId);

        // Throw on missing blogpost version
        if (!found) {
            console.error("Could not find the requested version.");
            return;
        }

        selectedVersion = undefined;    // Reset selectedVersion
        await tick();                   // Svelte Tick to force reactivity
        selectedVersion = found;        // Set Versions

        editorContent = selectedVersion.versionData.content || "";

        // Store editor state
        const state: EditorActions.EditorSessionState = {
            versionId: selectedVersion.id,
            isEditing: false,
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(state))
    }

    async function startEditing(loadDraft: boolean = false) {
        if(isEditing || !blogPost || !user || !selectedVersion) return;
        isEditing = true;

        let oldDraft: VersionDraft | undefined;

        if(loadDraft) {
            const backup = localStorage.getItem(`draft_backup_${selectedVersion.id}`);
            if (backup) {
                try { oldDraft = JSON.parse(backup); } catch( error) { console.error("Error loading old draft", error) }
            } 
        }

        if(oldDraft) {
            selectedDraft = oldDraft;
            popupStack.open({ title: "Draft Restored", message: "Restored your existing draft.", type: "text", variant: "toast" });
        } else {
            selectedDraft = EditorActions.createNewDraft(blogPost.id, selectedVersion, user.getId());
            popupStack.open({ title: "Started Editing", message: "Created a new draft.", type: "text", variant: "toast" });
        }

        editorContent = selectedDraft.versionData.content || "";
        EditorActions.saveLocalSession(blogPost.id, selectedVersion.id, true);
    }

    function debounceSave() {
        clearTimeout(saveTimeout);

        saveTimeout = setTimeout(async () => {
            await saveDraft();
        }, TIMEOUT)
    }

    //#region Updates
    function handleEditorUpdate(event: CustomEvent<{ content: any }>) {
        editorContent = event.detail.content;
        if(!selectedDraft || !selectedVersion || !isEditing) return;

        hasUnsavedChanges = true;

        // Update draft data
        selectedDraft.versionData.content = editorContent;
        selectedDraft.lastEdited = new Date();
 
        // Update local storage
        const localStorageKey = `draft_backup_${selectedVersion.id}`;
        localStorage.setItem(localStorageKey, JSON.stringify(selectedDraft));

        debounceSave();
    }

    function handleMetaUpdate() {
        if(!selectedDraft || !selectedVersion || !isEditing) return;

        hasUnsavedChanges = true;

        // Update local storage 
        const localStorageKey = `draft_backup_${selectedVersion.id}`;
        localStorage.setItem(localStorageKey, JSON.stringify(selectedDraft));

        debounceSave();
    }

    function handleStatusUpdate() {
        if(!selectedDraft || !selectedVersion || !isEditing) return;

        hasUnsavedChanges = true;

        // Update local storage 
        const localStorageKey = `draft_backup_${selectedVersion.id}`;
        localStorage.setItem(localStorageKey, JSON.stringify(selectedDraft));

        debounceSave();
    }
    //#endregion

    //#region Save
    async function saveDraft() {
        if(!isEditing || !selectedVersion || !selectedDraft) return; 

        isSavingDraft = true;

        try {
            await EditorActions.saveDraftToServer(selectedDraft)
            hasUnsavedChanges = false;
        } catch(error) {
            console.error(error)
        } finally {
            isSavingDraft = false;
        }
    }

    async function saveVersion(saveToNewVersion: boolean = false) {
        if(isSavingCommit || !selectedVersion || !blogPost) return

        // Stop autosaves
        clearTimeout(saveTimeout);
        isSavingCommit = true;        

        try {
            const updatedPost = await EditorActions.commitVersion(selectedDraft, saveToNewVersion, changeMessage)
            
            blogPost = updatedPost;
            selectedVersion = saveToNewVersion ? blogPost.getVersion("latest") : blogPost.getVersion(selectedVersion?.id || "")

            isEditing = false;
            hasUnsavedChanges = false;
            selectedDraft = undefined;
            changeMessage = "";
            await tick();

            localStorage.removeItem(`draft_backup_${selectedVersion?.id}`);
            if (blogPost) EditorActions.saveLocalSession(blogPost.id, selectedVersion?.id || null, false);
            popupStack.open({ title: "Success", message: "Version Saved!", type: "text", variant: "toast" });

        } catch(error) {
            popupStack.open({ title: "Error", message: String(error), type: "text", variant: "toast" });
        } finally {
            isSavingCommit = false;
        }
    }
    //#endregion

    //#region Cancel/Delete/Restore
    function cancelChanges() {
        if(!blogPost || !selectedVersion || !user) return;
        if(!confirm("Are you sure you want to permanently revert the changes you made to this Version?")) return;
        clearTimeout(saveTimeout);

        selectedDraft = EditorActions.createNewDraft(blogPost.id, selectedVersion, user.getId());
        editorContent = selectedDraft.versionData.content || "";

        isEditing = false;
        hasUnsavedChanges = false;
        localStorage.removeItem(`draft_backup_${selectedVersion.id}`);
        popupStack.open({ title: "Cancelled", message: "Changes reverted.", type: "text", variant: "toast" });
    }

    async function deleteVersion(version?: BlogPostVersion) {
        if(!version) return;
        if(!confirm("Are you sure you want to permanently delete this version?")) return;
        
        try {
            await EditorActions.deleteVersionFromServer(version.id);
            
            if(blogPost) {
                blogPost.deleteVersion(version.id);
                blogPost = blogPost;
                selectedVersion = blogPost?.getVersion("latest") ?? blogPost?.versions?.[0];
                popupStack.open({ title: "Deleted", message: "Version removed.", type: "text", variant: "toast" });
            }

        } catch (error) {
            popupStack.open({ title: "Error", message: String(error), type: "text", variant: "toast" });
        }
    }

    async function handleRestoreDraft(event: CustomEvent<{ revision: Revision }>) {
        const { revision } = event.detail;

        if (!blogPost || !selectedVersion || !user) return;
        isSavingDraft = true;

        try {
            const restoredData = await EditorActions.getRestoredVersionData(revision);

            if (!isEditing || !selectedDraft) {
                await startEditing(false);
            }

            if (!selectedDraft) throw new Error("Could not create/find draft to restore into.");

            selectedDraft.versionData = restoredData.versionData;
            selectedDraft.editorData = restoredData.editorData;

            editorContent = selectedDraft.versionData.content || "";
            isEditing = true;
            hasUnsavedChanges = true;

            const localStorageKey = `draft_backup_${selectedVersion.id}`;
            localStorage.setItem(localStorageKey, JSON.stringify(selectedDraft));
            await saveDraft();

            debounceSave();

            popupStack.open({ title: "Restored", message: "Draft reconstructed from history.", type: "text", variant: "toast" });

        } catch (error) {
            console.error("Failed to restore draft:", error);
            popupStack.open({ title: "Error", message: "Could not restore history.", type: "text", variant: "toast" });
        } finally {
            isSavingDraft = false;
        }
    }
    //#endregion
</script>

{#if user instanceof User && !error}
    <div class="w-full h-[calc(100vh-10rem)]">

        <!-- Heading -->
        <div class="w-full  flex items-center justify-between space-x-3">
            <!-- Heading -->
            {#if blogPost}
                <div class="flex flex-row items-center justify-between">
                    <div>
                        <div class="flex items-center">
                            <!-- Blog Title -->
                            <h1 class="flex items-center justify-center space-x-5">
                                {#if selectedVersion && selectedVersion.versionData && selectedVersion.versionData.title}
                                    <div class="flex items-center justify-center space-x-5">
                                        <div> {selectedVersion.versionData.title} </div>

                                        <Tooltip text={"View Blog Post"}>
                                            <a href={`/blog/${blogPost.id}`}>
                                                <Iconify iconId={"material-symbols-light:visibility-outline-rounded"} button={true} height={24}/>
                                            </a>
                                        </Tooltip>

                                        <div class="flex items-center justify-center">
                                            {#if selectedVersion.versionData.title != blogPost.title}
                                                <Tooltip text={`${blogPost.title} the currently actual blogpost title`}>
                                                    <span class="text-gray-500 text-xl">{blogPost.title}</span>
                                                </Tooltip>      
                                            {/if}
                                        </div>
                                    </div>
                                {:else}
                                    {blogPost.title}
                                {/if}
                            </h1>
                        </div>

                        <div class="flex items-center space-x-4">
                            <div class="flex items-center">
                                <Iconify iconId={"material-symbols-light:calendar-clock-outline-rounded"} height={18} inline={true}/>
                                {#if blogPost.creationDate}
                                    <p class="text-sm text-gray-500!">{formatDate(blogPost.creationDate)}</p>
                                {/if}
                            </div>

                            <div>
                                {#if selectedVersion && selectedVersion.versionData.description}
                                    <button 
                                        class="text-sm text-gray-500!" 
                                        on:click={() => {$showDescription = !$showDescription}}
                                    >
                                        {$showDescription ? 'Hide Description' : 'Show Description'}
                                    </button>
                                {/if}
                            </div>

                        </div> 

                        <!-- Description -->
                        <div class="mt-2 flex flex-col items-start">
                            {#if $showDescription && selectedVersion?.versionData.description}
                                <div transition:slide={{ duration: 300 }} class="overflow-hidden">
                                    <p class="text-sm text-gray-500!">
                                        {selectedVersion.versionData.description}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Edtiting Info -->
                    {#if isEditing}
                        <div class="flex flex-row items-center justify-center space-x-10" in:fade={{duration: 200, delay: 200}}>
                            <!-- Save State -->
                            <div>
                                {#if isSavingDraft}
                                    <Tooltip placement="left" text={"Saving ..."}>
                                        <Iconify iconId={"material-symbols-light:save-outline-rounded"} style={"color: yellow"}/>
                                    </Tooltip>
                                {:else if hasUnsavedChanges}
                                    <Tooltip placement="left" text={"Unsaved Changes"}>
                                        <Iconify iconId={"material-symbols-light:save-outline-rounded"} style={"color: red"}/>
                                    </Tooltip>
                                {:else}
                                    <Tooltip placement="left" text={"Saved"}>
                                        <Iconify iconId={"material-symbols-light:check-circle-outline-rounded"} style={"color: green"}/>
                                    </Tooltip>
                                {/if}
                            </div>

                            <!-- Viewer Information -->
                            <div>
                                <p class="text-xs! text-gray-500!">Currently <span>{(isEditing ? "Editing" : "Viewing")}</span></p>
                                <p> 
                                    <span class="text-primary-500! font-bold text-sm!">{selectedVersion.versionNumber}</span>
                                    <span class="text-sm! text-gray-500!">-</span>  
                                    <span class="text-primary-500! font-bold! text-sm!">{selectedVersion.EditorData.title}</span>
                                </p>
                                <p class="text-xs! text-gray-500!">
                                    <span>of</span> <span class="text-primary-500! font-semibold! text-sm!">{selectedVersion.versionData.title}</span>
                                </p>
                            </div>
                        </div>
                    {/if}
                </div>
            <!-- Heading Skeleton -->
            {:else}
                <div class="flex items-center animate-pulse">
                    <h1 class="mb-2! bg-gray-200 rounded-full w-80 h-8">&nbsp;</h1>
                </div>

                <div class="flex items-center animate-pulse">
                    <span class="animate-pulse w-64 h-4 bg-gray-200  rounded-full" />

                </div> 
            {/if}


        </div>

        <hr class="border!">

        <!-- Grid -->
        <div class="flex w-full space-x-5 h-full">

            <SideBar 
                bind:isOpen={$showEditorTools}
                position="left"
                barName={"Editor Tools"}
            >

                {#if isEditing}
                    <NodeEditor editor={editorInstance}/>

                    <SaveActions 
                        bind:changeMessage={changeMessage}
                        isSavingCommit={isSavingCommit}
                        on:save={(event) => saveVersion(event.detail)}
                        on:cancel={cancelChanges}
                    />

                    <StatusManagement 
                        bind:selectedDraft={selectedDraft}
                        bind:selectedVersion={selectedVersion}
                        on:update={handleStatusUpdate}
                    />

                    <Metadata 
                        bind:selectedDraft={selectedDraft}
                        on:update={handleMetaUpdate}
                    />

                {:else}
                    <ViewerActions 
                        selectedVersion={selectedVersion} blogPost={blogPost} user={user} 
                        on:startEditing={() => startEditing(false)}
                        on:deleteVersion={() => deleteVersion(selectedVersion)}
                    />
                {/if}

                <ToC editorContent={editorContent}/>

                <Differences 
                    selectedVersion={selectedVersion}
                />

                <History 
                    selectedVersion={selectedVersion}
                    on:restore={handleRestoreDraft}
                />

            </SideBar>

            <!-- BLog Editor -->
            <div class="flex-1 min-w-0 flex flex-col ease-in-out overflow-y-auto scroll-p-20 overflow-x-hidden">
                <div class={isEditing ? "rounded-xl h-fit p-2.5 tape" : "rounded-xl h-fit p-2.5"}> 
                    {#if editorContent !== undefined}
                        {#key selectedVersion?.id}
                            <Tiptap 
                                bind:editor={editorInstance}
                                on:change={handleEditorUpdate} 
                                content={editorContent} 
                                isEditable={isEditing}
                            />
                        {/key}
                    {:else}
                        <div class="animate-pulse bg-gray-100 w-full h-96 rounded-xl"></div>
                    {/if}
                </div>
            </div>

            <SideBar
                bind:isOpen={$showVersionManagement}
                position={"right"}
                barName={"Version Management"}
            >
                <CurrentVersion selectedVersion={selectedVersion} />
                <VersionManagement blogPost={blogPost} selectedVersionId={selectedVersion?.id} on:loadVersion={(event) => loadVersion(event.detail)}/>
            </SideBar>

        </div>
    </div>    
{/if}
