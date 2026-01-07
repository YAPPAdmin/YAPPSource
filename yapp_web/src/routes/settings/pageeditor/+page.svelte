<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';
	import Canvas from '$lib/svelteComponents/homepage/editor/Canvas.svelte';
	import Palette from '$lib/svelteComponents/homepage/editor/Palette.svelte';
	import Props from "$lib/svelteComponents/homepage/editor/Props.svelte"
	import { Layout, type YAPPComponentBase, type YAPPLayout } from '$lib/customRenderer/customRendere';
	import { SchemaRegistry } from '$lib/svelteComponents/homepage/schemas';
    import { onDestroy, onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import Iconify from '$lib/svelteComponents/iconify/Iconify.svelte';
    import { dev } from '$app/environment';
    import { popupStack } from '$lib/popups/popup';
    import { invalidateAll } from '$app/navigation';
    import { page } from "$app/state"	
    import Dropdown from '$lib/svelteComponents/base/Dropdown.svelte';
    import { browser } from '$app/environment';

    let leftWidth = 20;
    let rightWidth = 20;
    let dragging = null;

    function startDrag(which) {
        dragging = which;
        document.body.style.userSelect = "none";
    }

    function stopDrag() {
        dragging = null;
        document.body.style.userSelect = "";
    }

    function onDrag(element) {
        if(!dragging) return;

        const total = window.innerWidth;
        if(dragging == "left") {
            leftWidth = Math.min(40, Math.max(10, (element.clientX / total) * 100));
        } else if(dragging == "right") {
            const fromRight = total - element.clientX;
            rightWidth = Math.min(40, Math.max(10, (fromRight / total) * 100));
        }
    }


    let layoutRegistry = browser ? page.data?.layoutRegistry ?? [] : [];
    let loadedLayout = browser ? page.data?.loadedLayout ? Layout.fromJSON(page.data.loadedLayout) : null : null;

    let showPalette = false;

    let layout = writable(loadedLayout ?? {
        blocks: [],
        layout: { main: false, blocks: [] },
        id: '',
        name: '',
    });

    let selectedComponentId: string | null = null;

    $: selectedComponent = ($layout?.blocks || []).find(block => block.id === selectedComponentId) ?? null;


    let isUnsaved = writable(false);
    let isSaving = false;

    onMount(() => {
        const handler = (event: BeforeUnloadEvent) => {
            if (get(isUnsaved)) {
                event.preventDefault();
                event.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handler);

        (async () => {
            if (loadedLayout) {
                layout.set(Layout.fromJSON(loadedLayout));
            } else {
                layout.set({
                    blocks: [],
                    layout: { main: false, blocks: [] },
                    id: '',
                    name: '',
                });
            }

            if (browser) {
                const lastLayoutId = localStorage.getItem('lastSelectedLayoutId');
                if (lastLayoutId && lastLayoutId !== get(layout).id) {
                    await selectLayout(lastLayoutId);
                }
            }
        })();

        return () => window.removeEventListener('beforeunload', handler);
    });

    function addComponent(type: keyof typeof SchemaRegistry) {
        const component = SchemaRegistry[type];

        const newComponent = { 
            id: uuidv4().replace(/-/g, ""), 
            type: type,
            component: component.component,
            schema: component.schemaDefault,
        };

        layout.update(l => {
            l.addBlock(newComponent);
            return l;
        });

        selectedComponentId = newComponent.id;
        isUnsaved.set(true);
    }

    function removeComponent(id: string) {
        layout.update(l => {
            l.removeBlock(id);
            return l;
        });

        if (selectedComponentId === id) selectedComponentId = null;
        isUnsaved.set(true);
    }

    function selectComponent(id: string) {
        selectedComponentId = id;
    }

    function updateProp(path: (string | number)[], value: any) {
        if (!selectedComponentId) return;

        layout.update(l => {
            const blocks = (l.layout.blocks ?? []).map(block => {
                if (block.id !== selectedComponentId) return block;

                const newSchema = structuredClone(block.schema);
                let target: any = newSchema;

                for (let i = 0; i < path.length - 1; i++) {
                    target = target[path[i]];
                }

                target[path[path.length - 1]] = value;
                return { ...block, schema: newSchema };
            });

            l.layout.blocks = blocks;
            isUnsaved.set(true);
            return l;
        });
    }

    function moveBlock(from: number, to: number) {
        layout.update(l => {
            const blocks = [...(l.layout.blocks ?? [])];
            const [moved] = blocks.splice(from, 1);
            blocks.splice(to, 0, moved);
            l.layout.blocks = blocks;
            return l;
        });
        isUnsaved.set(true);
    }

    async function createNewEmptyLayout() {
        try {
            const result = await fetch("/api/webpage", {
                method: "POST",
                body: JSON.stringify({name: "Empty Layout", type: "home"})
            });

            if(result.status != 201) {
                popupStack.open({
                    title: "Something Went Wrong",
                    variant: "modal",
                    message: "Something Went Wrong while trying to creating a new Layout",
                    type: "text",
                })
            }

            if (browser) localStorage.removeItem('lastSelectedLayoutId');

            // Reload Layout Registry
            await reloadRegistry();

        } catch(error) {
            popupStack.open({
                title: "Something Went Wrong",
                variant: "modal",
                message: "Something Went Wrong while trying to creating a new Layout",
                type: "text",
            })
        }
    }

    async function saveChanges() {
        const currentLayout = get(layout);

        try {
            popupStack.open({
                title: "Saving Changes ...",
                message: "",
                type: "text",
                variant: "toast",
                
            });

            const response = await fetch("/api/webpage/", {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(currentLayout.toJSON())
            })

            if(response.ok) {
                isUnsaved.set(false);
                popupStack.open({
                    title: "Saved Successfully",
                    message: "Changes saved successfully",
                    type: "text",
                    variant: "toast"
                });
            } else {
                const error = await response.json();
                popupStack.open({
                    title: "Error Saving",
                    message: error,
                    type: "text",
                    variant: "toast"
                })
            }

        } catch(error) {
            popupStack.open({
                title: "Error Saving",
                message: String(error),
                type: "text",
                variant: "toast"
            })
        }
    }

    async function reloadRegistry() {
        try {
            const result = await fetch("/api/webpage?onlyReg=true");
            const data = await result.json();

            const newRegistry = Array.isArray(data.message) ? [...data.message] : [];
        
            layoutRegistry = newRegistry;
        
        } catch (err) {
            console.error("Failed to reload registry:", err);
        }
    }

    async function selectLayout(layoutId: string) {
        if(layoutId == get(layout).id) return;

        try{
            const result = await fetch(`/api/webpage?id=${layoutId}`)
            const data = await result.json()

            const dbLayout = Layout.fromJSON(data.message)
            layout.set(dbLayout)
        
            if(browser) {
                localStorage.setItem("lastSelectedLayoutId", layoutId)
            }

        } catch(error) {
            console.error(error)
            popupStack.open({
                title: "Something went wrong",
                variant: "toast",
                type: "text",
                message: String(error),
            })
        }
    }

</script>


<div class="w-full mb-5 flex flex-row items-center justify-start gap-5">
    <!-- Version Selector -->
    <div class="flex flex-wrap items-center gap-x-1.5">
        <Dropdown position={"left"}>
            <div
                class="flex p-2 justify-between items-center w-64 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:border-blue-400 hover:ring-1 hover:ring-blue-300 transition-all duration-150"
            >

                {#if $layout.name}
                    <input 
                        class="truncate font-medium !border-none hover:!bg-white w-full h-full !text-lg !text-primary-500"
                        bind:value={$layout.name}
                    />
                {:else}
                    <span class="truncate font-medium text-gray-700">
                        Select a layout
                    </span>
                {/if}


            </div>

            <div slot="content">
                    <button
                        class="w-full m-2 min-w-96 text-left px-3 py-2 rounded flex flex-col cursor-pointer transform transition-transform duration-150 hover:scale-102"
                        on:click={createNewEmptyLayout}
                    >
                        <h2 class="font-semibold !text-md">New Layout</h2>
                    </button>

                    {#if layoutRegistry && layoutRegistry.length > 0}
                        <hr class="!m-0" />
                    {/if}

                {#each layoutRegistry as entry }
                    <button
                        class="w-full m-2 min-w-96 text-left px-3 py-2 rounded flex flex-col cursor-pointer transform transition-transform duration-150 hover:scale-102"
                        on:click={() => selectLayout(entry.id)}
                    >

                        <div class="flex justify-between items-center">
                            <h3 
                                class="!font-semibold !text-secondary-500 !p-0 !border-none"
                            >
                                {entry.name ?? "Empty Layout"}
                            </h3>
                            
                            {#if $layout.id == entry.id}
                                <h4 class="mr-4 !text-sm">Selected</h4>
                            {/if}   
                        </div>

                        <span class="text-xs text-gray-500">
                            Author: {entry.authorId} - Last Updated: {entry.metadata?.lastUpdated ? new Date(entry.metadata.lastUpdated).toLocaleString() : 'N/A'}
                        </span>
                    </button>
                {/each}
            </div>
        </Dropdown>
    </div>

    <div>
        <span class={ $isUnsaved ? 'text-red-500' : 'text-green-500' }>
            { $isUnsaved ? 'Unsaved' : 'Saved' }
        </span>
    </div>
    
    <button class="defaultButton !mt-0" on:click={saveChanges}>
        Save Layout
    </button>



</div>

<svelte:window on:mousemove={onDrag} on:mouseup={stopDrag} />

<!-- Layout container -->
<div class="flex flex-row w-full h-screen overflow-hidden">

    {#if $layout && $layout.blocks}
        <!-- Palette -->
        <div style="width: {leftWidth}%" class="rounded-2xl p-4 flex flex-col  bg-base-100">
            <h2 class="text-lg w-full font-semibold text-secondary mb-2">Component Palette</h2>
    
            <Palette components={SchemaRegistry} {addComponent} />
        </div>

        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
			class="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors"
			on:mousedown={() => startDrag('left')}
		></div>

        <!-- Canvas -->
		<div
			class="border-x border-gray-100 flex flex-col overflow-hidden relativep-3 flex-1 rounded-xl"
			style="width: calc(100% - {leftWidth}% - {rightWidth}% - 2px)"
		>
            <Canvas
                layout={{ ...$layout.layout, id: $layout.id }}
                selectedComponentId={selectedComponentId}
                removeComponent={removeComponent}
                selectComponent={selectComponent}
                on:move={(event) => moveBlock(event.detail.from, event.detail.to)}
            />            
        </div>

        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
			class="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors"
			on:mousedown={() => startDrag('right')}
		></div>

        <!-- Props -->  
        <div style="width: {rightWidth}%" class="rounded-2xl p-4 flex flex-col bg-base-100">
            <h2 class="text-lg w-full font-semibold text-secondary mb-2">Properties</h2>
            
            <div class="flex sticky overflow-y-auto max-h-[75vh]">
                <Props {selectedComponent} {updateProp} />
            </div>
        </div>
    {/if}
</div>


<style>
	.cursor-col-resize {
		cursor: col-resize;
	}
</style>