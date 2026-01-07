<!-- Canvas.svelte -->
<script lang="ts">
    import Mobile from './mockups/Mobile.svelte';
    import Desktop from './mockups/Desktop.svelte';
    import Tablet from './mockups/Tablet.svelte';
    import type { Layout } from '$lib/customRenderer/customRendere';
    import Iconify from '$lib/svelteComponents/iconify/Iconify.svelte';
    import { scale } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { flip } from 'svelte/animate';
    import { SchemaRegistry } from '../schemas';

    let viewMode: "desktop" | "mobile" | "tablet" | null | string = null;

    export let layout: Layout<any>;
    export let selectedComponentId: string | null;
    export let removeComponent: (id: string) => void;
    export let selectComponent: (id: string) => void;

    const dispatch = createEventDispatcher();

    let draggedIndex: number | null = null;
    let dropIndex: number | null = null;

    function getComponentFromType(type: string) {
        return SchemaRegistry[type]?.component;
    }

    $: mappedBlocks = layout?.blocks?.map(block => ({
        ...block,
        component: getComponentFromType(block.type)
    })) || [];

    function handleDragStart(event: DragEvent, index: number) {
        draggedIndex = index;
        dropIndex = null;
        event.dataTransfer?.setData("text/plain", String(index));
        event.dataTransfer!.effectAllowed = "move";
    }

    function handleDrop(event: DragEvent, index: number) {
        event.preventDefault();

        if(draggedIndex == null || dropIndex == null) return;

        dispatch("move", {from: draggedIndex, to: dropIndex });
        draggedIndex = null;
        dropIndex = null;
    }

    function handleDragOver(event: DragEvent, index: number) {
        event.preventDefault();

        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const halfway = rect.top + rect.height / 2;

        dropIndex = event.clientY > halfway ? index + 1 : index;
    }

    function handleDrageEnd() {
        draggedIndex = null;
        dropIndex = null;
    }

</script>

<div class="flex flex-col ">

    <!-- View mode buttons -->
    <div class="flex justify-center gap-2">
    {#each ['mobile','tablet','desktop',null] as mode}
        <button
        class="px-3 py-1 rounded-md border border-gray-400 transition
                hover:bg-gray-200
                {mode === viewMode ? 'bg-blue-500 text-white' : ''}"
        on:click={() => viewMode = mode}
        >
        {mode === 'mobile' ? '📱 Mobile' :
            mode === 'tablet' ? '💻 Tablet' :
            mode === 'desktop' ? '🖥 Desktop' :
            'None'}
        </button>
    {/each}
    </div>


    {#if viewMode === 'mobile'}
        <Mobile>
            {#if mappedBlocks}
                {#each mappedBlocks as component, index (component.id)}
                    <div animate:flip={{ duration: 200 }}>
                        <div
                            class="relative w-full h-full p-0.5 overflow-visible group rounded-lg bg-white/70 cursor-move transition-all duration-150
                            {draggedIndex === index ? 'opacity-50 scale-80' : ''}"
                            role="listitem"
                            aria-grabbed={draggedIndex == index}
                            draggable="true"
                            on:dragstart={(event) => handleDragStart(event, index)}
                            on:dragover={(event) => handleDragOver(event, index)}
                            on:drop={handleDrop}
                            on:dragend={handleDrageEnd}
                        >
                            <!-- Delete Button -->
                            <button
                                aria-label="Remove component"
                                on:click|stopPropagation={() => removeComponent(component.id)}
                                class="absolute top-2 right-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                    text-xs transition-opacity cursor-pointer
                                    opacity-0 group-hover:opacity-100
                                    {component.id === selectedComponentId ? 'opacity-100' : ''}"
                                title="Remove component"
                            >
                                <Iconify iconId="material-symbols-light:cancel-outline-rounded" style="color: red" />
                            </button>

                            <!-- Move Buttons -->
                            <div>
                                {#if index >0}
                                    <button
                                        aria-label="Move component up"
                                        on:click|stopPropagation={() => dispatch('move', { from: index, to: index - 1 })}
                                        class="absolute top-2 left-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                            text-xs transition-opacity cursor-pointer
                                            opacity-0 group-hover:opacity-100"
                                        title="Move up"
                                    >
                                        <Iconify iconId="material-symbols:arrow-upward" style="color: gray" />
                                    </button>
                                {/if}
                                {#if index < layout.blocks.length - 1}
                                    <button
                                        aria-label="Move component down"
                                        on:click|stopPropagation={() => dispatch('move', { from: index, to: index + 1 })}
                                        class="absolute top-10 left-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                            text-xs transition-opacity cursor-pointer
                                            opacity-0 group-hover:opacity-100"
                                        title="Move down"
                                    >
                                        <Iconify iconId="material-symbols:arrow-downward" style="color: gray" />
                                    </button>
                                {/if}
                            </div>

                            <!-- Component Wrapper -->
                            <button
                                class="w-full h-full rounded-md transition-all duration-200 ease-out
                                    hover:-translate-y-1 hover:shadow-xl shadow-lg
                                    {component.id === selectedComponentId
                                        ? 'outline-4 outline-primary-600 shadow-xl scale-[1.02] bg-primary/10'
                                        : 'bg-white'}"
                                on:click={() => selectComponent(component.id)}
                            >
                                <svelte:component
                                    this={component.component}
                                    componentContent={component.schema}
                                />
                            </button>
                        </div>

                        {#if dropIndex === index}
                            <div class="h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] rounded-full my-1 transition-all duration-150"></div>
                        {/if}
                    </div>
                {/each}


                {#if dropIndex === layout.blocks.length}
                    <div class="h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] rounded-full my-1 transition-all duration-150"></div>
                {/if}
            {/if}
        </Mobile>
    {:else if viewMode === 'desktop'}
        <Desktop>
            {#if mappedBlocks}
                {#each mappedBlocks as component, index (component.id)}
                    <div animate:flip={{ duration: 200 }}>
                        <div
                            class="relative w-full h-full p-0.5 overflow-visible group rounded-lg bg-white/70 cursor-move transition-all duration-150
                            {draggedIndex === index ? 'opacity-50 scale-80' : ''}"
                            role="listitem"
                            aria-grabbed={draggedIndex == index}
                            draggable="true"
                            on:dragstart={(event) => handleDragStart(event, index)}
                            on:dragover={(event) => handleDragOver(event, index)}
                            on:drop={handleDrop}
                            on:dragend={handleDrageEnd}
                        >
                            <!-- Delete Button -->
                            <button
                                aria-label="Remove component"
                                on:click|stopPropagation={() => removeComponent(component.id)}
                                class="absolute top-2 right-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                    text-xs transition-opacity cursor-pointer
                                    opacity-0 group-hover:opacity-100
                                    {component.id === selectedComponentId ? 'opacity-100' : ''}"
                                title="Remove component"
                            >
                                <Iconify iconId="material-symbols-light:cancel-outline-rounded" style="color: red" />
                            </button>

                            <!-- Move Buttons -->
                            <div>
                                {#if index >0}
                                    <button
                                        aria-label="Move component up"
                                        on:click|stopPropagation={() => dispatch('move', { from: index, to: index - 1 })}
                                        class="absolute top-2 left-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                            text-xs transition-opacity cursor-pointer
                                            opacity-0 group-hover:opacity-100"
                                        title="Move up"
                                    >
                                        <Iconify iconId="material-symbols:arrow-upward" style="color: gray" />
                                    </button>
                                {/if}
                                {#if index < layout.blocks.length - 1}
                                    <button
                                        aria-label="Move component down"
                                        on:click|stopPropagation={() => dispatch('move', { from: index, to: index + 1 })}
                                        class="absolute top-10 left-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                            text-xs transition-opacity cursor-pointer
                                            opacity-0 group-hover:opacity-100"
                                        title="Move down"
                                    >
                                        <Iconify iconId="material-symbols:arrow-downward" style="color: gray" />
                                    </button>
                                {/if}
                            </div>

                            <!-- Component Wrapper -->
                            <button
                                class="w-full h-full rounded-md transition-all duration-200 ease-out
                                    hover:-translate-y-1 hover:shadow-xl shadow-lg
                                    {component.id === selectedComponentId
                                        ? 'outline-4 outline-primary-600 shadow-xl scale-[1.02] bg-primary/10'
                                        : 'bg-white'}"
                                on:click={() => selectComponent(component.id)}
                            >
                                <svelte:component
                                    this={component.component}
                                    componentContent={component.schema}
                                />
                            </button>
                        </div>

                        {#if dropIndex === index}
                            <div class="h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] rounded-full my-1 transition-all duration-150"></div>
                        {/if}
                    </div>
                {/each}


                {#if dropIndex === layout.blocks.length}
                    <div class="h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] rounded-full my-1 transition-all duration-150"></div>
                {/if}
            {/if}
        </Desktop>
    {:else if viewMode === 'tablet'}
        <Tablet>
            {#if mappedBlocks}
                {#each mappedBlocks as component, index (component.id)}
                    <div animate:flip={{ duration: 200 }}>
                        <div
                            class="relative w-full h-full p-0.5 overflow-visible group rounded-lg bg-white/70 cursor-move transition-all duration-150
                            {draggedIndex === index ? 'opacity-50 scale-80' : ''}"
                            role="listitem"
                            aria-grabbed={draggedIndex == index}
                            draggable="true"
                            on:dragstart={(event) => handleDragStart(event, index)}
                            on:dragover={(event) => handleDragOver(event, index)}
                            on:drop={handleDrop}
                            on:dragend={handleDrageEnd}
                        >
                            <!-- Delete Button -->
                            <button
                                aria-label="Remove component"
                                on:click|stopPropagation={() => removeComponent(component.id)}
                                class="absolute top-2 right-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                    text-xs transition-opacity cursor-pointer
                                    opacity-0 group-hover:opacity-100
                                    {component.id === selectedComponentId ? 'opacity-100' : ''}"
                                title="Remove component"
                            >
                                <Iconify iconId="material-symbols-light:cancel-outline-rounded" style="color: red" />
                            </button>

                            <!-- Move Buttons -->
                            <div>
                                {#if index >0}
                                    <button
                                        aria-label="Move component up"
                                        on:click|stopPropagation={() => dispatch('move', { from: index, to: index - 1 })}
                                        class="absolute top-2 left-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                            text-xs transition-opacity cursor-pointer
                                            opacity-0 group-hover:opacity-100"
                                        title="Move up"
                                    >
                                        <Iconify iconId="material-symbols:arrow-upward" style="color: gray" />
                                    </button>
                                {/if}
                                {#if index < layout.blocks.length - 1}
                                    <button
                                        aria-label="Move component down"
                                        on:click|stopPropagation={() => dispatch('move', { from: index, to: index + 1 })}
                                        class="absolute top-10 left-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                            text-xs transition-opacity cursor-pointer
                                            opacity-0 group-hover:opacity-100"
                                        title="Move down"
                                    >
                                        <Iconify iconId="material-symbols:arrow-downward" style="color: gray" />
                                    </button>
                                {/if}
                            </div>

                            <!-- Component Wrapper -->
                            <button
                                class="w-full h-full rounded-md transition-all duration-200 ease-out
                                    hover:-translate-y-1 hover:shadow-xl shadow-lg
                                    {component.id === selectedComponentId
                                        ? 'outline-4 outline-primary-600 shadow-xl scale-[1.02] bg-primary/10'
                                        : 'bg-white'}"
                                on:click={() => selectComponent(component.id)}
                            >
                                <svelte:component
                                    this={component.component}
                                    componentContent={component.schema}
                                />
                            </button>
                        </div>

                        {#if dropIndex === index}
                            <div class="h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] rounded-full my-1 transition-all duration-150"></div>
                        {/if}
                    </div>
                {/each}


                {#if dropIndex === layout.blocks.length}
                    <div class="h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] rounded-full my-1 transition-all duration-150"></div>
                {/if}
            {/if}
        </Tablet>
    {:else}
        <div class="space-y-10 p-5" role="list">
            {#if mappedBlocks}
                {#each mappedBlocks as component, index (component.id)}
                    <div animate:flip={{ duration: 200 }}>
                        <div
                            class="relative w-full h-full p-0.5 overflow-visible group rounded-lg bg-white/70 cursor-move transition-all duration-150
                            {draggedIndex === index ? 'opacity-50 scale-80' : ''}"
                            role="listitem"
                            aria-grabbed={draggedIndex == index}
                            draggable="true"
                            on:dragstart={(event) => handleDragStart(event, index)}
                            on:dragover={(event) => handleDragOver(event, index)}
                            on:drop={handleDrop}
                            on:dragend={handleDrageEnd}
                        >
                            <!-- Delete Button -->
                            <button
                                aria-label="Remove component"
                                on:click|stopPropagation={() => removeComponent(component.id)}
                                class="absolute top-2 right-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                    text-xs transition-opacity cursor-pointer
                                    opacity-0 group-hover:opacity-100
                                    {component.id === selectedComponentId ? 'opacity-100' : ''}"
                                title="Remove component"
                            >
                                <Iconify iconId="material-symbols-light:cancel-outline-rounded" style="color: red" />
                            </button>

                            <!-- Move Buttons -->
                            <div>
                                {#if index >0}
                                    <button
                                        aria-label="Move component up"
                                        on:click|stopPropagation={() => dispatch('move', { from: index, to: index - 1 })}
                                        class="absolute top-2 left-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                            text-xs transition-opacity cursor-pointer
                                            opacity-0 group-hover:opacity-100"
                                        title="Move up"
                                    >
                                        <Iconify iconId="material-symbols:arrow-upward" style="color: gray" />
                                    </button>
                                {/if}
                                {#if index < layout.blocks.length - 1}
                                    <button
                                        aria-label="Move component down"
                                        on:click|stopPropagation={() => dispatch('move', { from: index, to: index + 1 })}
                                        class="absolute top-10 left-2 z-20 rounded-full w-6 h-6 flex items-center justify-center
                                            text-xs transition-opacity cursor-pointer
                                            opacity-0 group-hover:opacity-100"
                                        title="Move down"
                                    >
                                        <Iconify iconId="material-symbols:arrow-downward" style="color: gray" />
                                    </button>
                                {/if}
                            </div>

                            <!-- Component Wrapper -->
                            <button
                                class="w-full h-full rounded-md transition-all duration-200 ease-out
                                    hover:-translate-y-1 hover:shadow-xl shadow-lg
                                    {component.id === selectedComponentId
                                        ? 'outline-4 outline-primary-600 shadow-xl scale-[1.02] bg-primary/10'
                                        : 'bg-white'}"
                                on:click={() => selectComponent(component.id)}
                            >
                                <svelte:component
                                    this={component.component}
                                    componentContent={component.schema}
                                />
                            </button>
                        </div>

                        {#if dropIndex === index}
                            <div class="h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] rounded-full my-1 transition-all duration-150"></div>
                        {/if}
                    </div>
                {/each}


                {#if dropIndex === layout.blocks.length}
                    <div class="h-1 bg-blue-500 shadow-[0_0_8px_#3b82f6] rounded-full my-1 transition-all duration-150"></div>
                {/if}
            {/if}
        </div>
    {/if}

</div>


<style>
    @keyframes drop-line {
    from { transform: scaleX(0); opacity: 0.5; }
    to { transform: scaleX(1); opacity: 1; }
    }
</style>