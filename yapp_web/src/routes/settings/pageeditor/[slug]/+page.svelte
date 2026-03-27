<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';
	import { Layout, type YAPPComponentBase, type YAPPLayout } from '$lib/customRenderer/customRendere';
	import { SchemaRegistry } from '$lib/svelteComponents/homepage/modulesOld';
    import { onDestroy, onMount, tick } from 'svelte';
    import { get, writable } from 'svelte/store';
    import Iconify from '$lib/svelteComponents/iconify/Iconify.svelte';
    import { dev } from '$app/environment';
    import { popupStack } from '$lib/popups/popup';
    import { page } from "$app/state"	
    import { browser } from '$app/environment';
    import SideBar from '$lib/svelteComponents/blog/editor/editorComponents/SideBar.svelte';
    import Canvas from '$lib/svelteComponents/homepage/editor/editor/editorComponents/Canvas.svelte';
    import Palette from '$lib/svelteComponents/homepage/editor/editor/editorComponents/Palette.svelte';
    import Props from '$lib/svelteComponents/homepage/editor/editor/editorComponents/Props.svelte';
    import VersionManagement from '$lib/svelteComponents/homepage/editor/editor/components/VersionManagement.svelte';
    import CurrentVersion from '$lib/svelteComponents/homepage/editor/editor/components/CurrentVersion.svelte';
    import { PageLayout } from '$lib/utils/pageEditor/PageLayout';
    import type { PageLayoutDraft, PageLayoutVersion } from '$lib/utils/pageEditor/PageLayoutVersion';
    import { User } from '$lib/utils/auth/User';
    import * as EditorActions from "$lib/utils/pageEditor/EditorActions"
    import { formatDate, formatTime } from '$lib/utils/util';
    import Tooltip from '$lib/svelteComponents/base/Tooltip.svelte';
    import { persistedStore } from '$lib/utils/persistedStore.ts/persistedStore';
    import { slide } from 'svelte/transition';
    import SaveActions from '$lib/svelteComponents/homepage/editor/editor/components/SaveActions.svelte';
    import ViewActions from '$lib/svelteComponents/homepage/editor/editor/components/ViewActions.svelte';

    const pageData = page.data

    let SESSION_KEY: string = "";
    const TIMEOUT: number = 3000;

    //#region UI Vars
    const showDescription = persistedStore("ui_pl_showDescription", true);
    //#endregion

    const rawUser = page.data.user
    let user: User | undefined = rawUser ? User.fromJSON(rawUser) : undefined;

    let pageLayout: PageLayout | undefined;
    let selectedVersion: PageLayoutVersion | undefined;
    let selectedDraft: PageLayoutDraft | undefined;
    let selectedComponent: any;
    let selectedComponentId: string | undefined = undefined;
    
    let changeMessage = "";
    
    let error: string = "";
    let isEditing: boolean = false;
    let hasUnsavedChanges: boolean = false;
    let isSavingDraft: boolean = false;
    let isSavingCommit: boolean = false;
    let saveTimeout: ReturnType<typeof setTimeout>;

    onMount(async () => {
        if(!pageData.pageLayout || !user) { error = "404"; return; }

        const rawLayout = Array.isArray(pageData.pageLayout) 
            ? pageData.pageLayout[0] 
            : pageData.pageLayout;

        pageLayout = PageLayout.fromDbRecord(rawLayout)
        if(!pageLayout) { error = "404"; return; } 

        const sessionState = EditorActions.loadLocalSession(pageLayout.id);

        console.log(pageLayout)
        console.log(selectedVersion)

        if(sessionState?.versionId) {
            selectedVersion = pageLayout.getVersion(sessionState.versionId) || pageLayout.getVersion("latest");
        } else {
            selectedVersion = pageLayout.getVersion(pageLayout.mainVersionId || "");
        }

        if(sessionState?.isEditing) {
            await startEditing(true);
        } else {
            // editorContent = selectedVersion?.versionData.content || "";
            return;
        }
    }) 

    onDestroy(() => {
        if (saveTimeout) clearTimeout(saveTimeout);
        if (browser && pageLayout) {
            EditorActions.saveLocalSession(pageLayout.id, selectedVersion?.id || "", isEditing);
        }
    });

    function startEditing(loadDraft: boolean = false) {
        if(isEditing || !pageLayout || !user || !selectedVersion) return;
        isEditing = true;

        let oldDraft: PageLayoutDraft | undefined;

        if(loadDraft) {
            const backup = localStorage.getItem(`draft_backup_${selectedVersion.id}`);
            if (backup) {
                try { oldDraft = JSON.parse(backup); } catch( error) { console.error("Error loading old draft", error) }
            } 
        }

        if(oldDraft) {
            selectedDraft = oldDraft;
            popupStack.open({ title: "Draft Restored", message: `Restored your existing draft from ${formatDate(selectedDraft.lastEdit)}, ${formatTime(selectedDraft.lastEdit)}.`, type: "text", variant: "toast" });
        } else {
            selectedDraft = EditorActions.createNewDraft(pageLayout.id, selectedVersion, user.getId());
            popupStack.open({ title: "Started Editing", message: "Created a new draft.", type: "text", variant: "toast" });
        }

        EditorActions.saveLocalSession(pageLayout.id, selectedVersion.id, true)
    }

    async function loadVersion(versionId: string) {
        if(!pageLayout || !user?.getId()) return;

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
        const found = pageLayout?.getVersion(versionId)

        if(!found) {
            console.error("Could not find the requested version.");
            return;
        }

        selectedVersion = undefined;    // Reset selectedVersion
        await tick();                   // Svelte Tick to force reactivity
        selectedVersion = found;        // Set Versions

        // Store editor state
        const state: EditorActions.EditorSessionState = {
            versionId: selectedVersion.id,
            isEditing: false,
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(state))
    }

    function addComponentToDraft(newBlock: any) {
        if(!isEditing) startEditing();
        if(!isEditing || !selectedDraft) return;

        selectedDraft.blocks=[...(selectedDraft.blocks || []), newBlock];
        selectedComponentId = newBlock.id;
        selectedDraft = selectedDraft;
        hasChanges = true;
        
    }

    function removeComponent(id: string) {
        if(!isEditing || !selectedDraft) return;
        selectedDraft.blocks = selectedDraft.blocks.filter(block => block.id != id);
        hasChanges = true;
        if(selectedComponentId == id) {
            selectedComponent = undefined;
            selectedComponentId = undefined;
        }
        handleEditorUpdate();
    } 

    function handleEditorUpdate() {
        if(!selectedDraft || !selectedVersion || !isEditing) return;
        
        selectedDraft.lastEdit = new Date();
        selectedDraft = selectedDraft;

        const localStorageKey = `draft_backup_${selectedVersion.id}`;
        localStorage.setItem(localStorageKey, JSON.stringify(selectedDraft));

        debounceSave()
    }

    function debounceSave() {
        clearTimeout(saveTimeout);

        saveTimeout = setTimeout(async () => {
            await saveDraft();
        }, TIMEOUT)
    }

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

    function cancelChanges() {
        if(!pageLayout || !selectedVersion || !user) return;
        if(!confirm("Are you sure you want to permanently revert the changes you made to this Version?")) return;
        clearTimeout(saveTimeout);

        selectedDraft = EditorActions.createNewDraft(pageLayout.id, selectedVersion, user.getId());
        isEditing = false;
        hasUnsavedChanges = false;
        localStorage.removeItem(`draft_backup_${selectedVersion.id}`);
        popupStack.open({ title: "Cancelled", message: "Changes reverted.", type: "text", variant: "toast" });
    }

    async function saveVersion(saveToNewVersion: boolean = false) {
        if(isSavingCommit || !selectedVersion || !selectedDraft || !pageLayout) {
            console.warn("Save aborted: Missing data", { selectedVersion, pageLayout, selectedDraft });
            return;
        }

        clearTimeout(saveTimeout);
        isSavingCommit = true;

        try {
            const updatedPageLayout = await EditorActions.commitVersion(selectedDraft, saveToNewVersion, changeMessage)
            console.log("UPDATEDPAGELAYOUT: ", updatedPageLayout)

            pageLayout = updatedPageLayout;
            selectedVersion = saveToNewVersion ? pageLayout?.getVersion("latest") : pageLayout?.getVersion(selectedVersion?.id || "");

            isEditing = false;
            hasUnsavedChanges = false;
            selectedDraft = undefined;
            changeMessage = "";
            await tick();

            localStorage.removeItem(`draft_backup_${selectedVersion?.id}`);
            if(pageLayout) EditorActions.saveLocalSession(pageLayout.id, selectedVersion?.id || null, false);
            popupStack.open({ title: "Success", message: "Version Saved!", type: "text", variant: "toast" });

        } catch(error) {
            popupStack.open({ title: "Error", message: String(error), type: "text", variant: "toast" });
        } finally {
            isSavingCommit = false;
        }
    }

    async function deleteVersion() {
        if(!version) return;
        if(!confirm("Are you sure you want to permanently delete this version?")) return;

        try {
            await EditorActions.deleteVersionFromServer(version.id);

            if(pageLayout) {
                pageLayout.deleteVersion(version.id);
                pageLayout = pageLayout;
                selectedVersion = pageLayout?.getVersion("latest") ?? pageLayout?.version?.[0];
                popupStack.open({ title: "Deleted", message: "Version removed.", type: "text", variant: "toast"});
            }
        } catch (error) {
            popupStack.open({ title: "Error", message: String(error), type: "text", variant: "toast" });
        }
    }
    

</script>

<div class="w-full h-[calc(100vh-10rem)]">

    <!-- Heading -->
    <div class="w-full  flex items-center justify-between space-x-3">
        
        <!-- Heading -->
        <div class="w-full">
            {#if pageLayout}
                <div class="flex flex-row items-center justify-between">
                    <div>
                        <div class="flex items-center">
                            <!-- Layout Title -->
                             <h1 class="flex items-center justify-center space-x-5">
                                {#if selectedVersion && selectedVersion.versionTitle}
                                    <div>{selectedVersion.title}</div>
                                    <Tooltip text={"View PageLayout"}>
                                        <a href={`/settings/pageeditor/view?${pageLayout.id}`}>
                                            <Iconify iconId={"material-symbols-light:visibility-outline-rounded"} button={true} height={24}/>
                                        </a>
                                    </Tooltip>

                                    <div class="flex items-center justify-center">
                                        {#if selectedVersion.versionTitle != pageLayout.title}
                                            <Tooltip text={`${pageLayout.title} the currently actual page layout title`}>
                                                <span class="text-gray-500 text-xl">{pageLayout.title}</span>
                                            </Tooltip>      
                                        {/if}
                                    </div>
                                {:else}
                                    {pageLayout.title}
                                {/if}
                             </h1>
                        </div>

                        <!-- URL -->
                        <div class="mb-2 flex flex-col items-start">
                            <div transition:slide={{ duration: 300 }} class="overflow-hidden">
                            {#if pageLayout.page == "/"}
                                <p class="font-semibold! text-gray-500!">
                                    Main Page (/)
                                </p>
                            {:else}
                                <p class="font-semibold! text-gray-500!">
                                    {pageLayout.page}
                                </p>
                            {/if}
                            </div>
                        </div>

                        <div class="flex items-center space-x-4">
                            <div class="flex items-center">
                                <Iconify iconId={"material-symbols-light:calendar-clock-outline-rounded"} height={18} inline={true}/>
                                {#if pageLayout.creationDate}
                                    <p class="text-sm text-gray-500!">{formatDate(pageLayout.creationDate)}, {formatTime(pageLayout.creationDate)}</p>
                                {/if}
                            </div>

                            <div>
                                {#if selectedVersion && selectedVersion.description}
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
                            {#if $showDescription && selectedVersion?.versionDescription}
                                <div transition:slide={{ duration: 300 }} class="overflow-hidden">
                                    <p class="text-sm text-gray-500!">
                                        {selectedVersion.versionDescription}
                                    </p>
                                </div>
                            {/if}
                        </div>

                    </div>

                    <!-- Editing Info -->

                </div>
            {:else}
                <div class="flex items-center animate-pulse">
                    <h1 class="mb-2! bg-gray-200 rounded-full w-80 h-8">&nbsp;</h1>
                </div>

                <div class="flex items-center animate-pulse">
                    <span class="animate-pulse w-64 h-4 bg-gray-200  rounded-full" />
                </div> 
            {/if}
        </div>
        
    </div>

    <hr class="border!">

    <div class="flex w-full space-x-5 h-full">
        <SideBar barName={"Palette"}>
            {#if isEditing}
                <SaveActions 
                    bind:changeMessage={changeMessage}
                    isSavingCommit={isSavingCommit}
                    on:save={(event) => saveVersion(event.detail)}
                    on:cancel={cancelChanges}
                />
            {:else}
                <ViewActions 
                    selectedVersion={selectedVersion}
                    on:startEditing={() => startEditing(false)}
                    on:deleteVersion={() => deleteVersion(selectedVersion)}
                />
            {/if}
            <Palette on:addBlock={(event) => addComponentToDraft(event.detail)}/>
        </SideBar>

        <div class="flex-1 min-w-0 flex flex-col ease-in-out overflow-y-auto scroll-p-20 overflow-x-hidden">
            <Canvas
                blocks={isEditing ? (selectedDraft?.blocks || []) : (selectedVersion?.blocks || [])}
                selectedComponentId={selectedComponentId}
                isEditing={isEditing}
                on:removeBlock={(event) => removeComponent(event.detail.id)}
                on:selectBlock={(event) => { 
                    selectedComponent = event.detail; 
                    selectedComponentId = event.detail.id; 
                }}
            />            
        </div>

        <SideBar barName={"Props"}>
            <Props on:update={handleEditorUpdate} bind:selectedBlock={selectedComponent} />

            <CurrentVersion selectedVersion={selectedVersion} />
            <VersionManagement pageLayout={pageLayout} selectedVersionId={selectedVersion?.id} on:loadVersion={(event) => loadVersion(event.detail)}/>
        </SideBar>
    </div>
</div>

