<script lang="ts">
    import type { Component } from "svelte";
    import { createEventDispatcher } from "svelte";

    import ArrayInput from "./inputs/ArrayInput.svelte";
    import BooleanInput from "./inputs/BooleanInput.svelte";
    import ImageInput from "./inputs/ImageInput.svelte";
    import NumberInput from "./inputs/NumberInput.svelte";
    import ObjectInput from "./inputs/ObjectInput.svelte";
    import TextareaInput from "./inputs/TextareaInput.svelte";
    import TextInput from "./inputs/TextInput.svelte";
    import SelectInput from "./inputs/SelectInput.svelte";
    import EmailInput from "./inputs/EmailInput.svelte";
    import { dev } from "$app/environment";
    import { SchemaRegistry } from "../schemas";

    export let selectedComponent;
    export let updateProp: (path: (string | number)[], value: any) => void;

    $: schemaDefinition = selectedComponent?.type
        ? SchemaRegistry[selectedComponent.type]?.schemaDefinition
        : undefined;

    const inputMap: Record<string, typeof Component> = {
        string: TextInput,
        textarea: TextareaInput,
        number: NumberInput,
        image: ImageInput, 
        boolean: BooleanInput,
        array: ArrayInput,
        object: ObjectInput,
        select: SelectInput,
        email: EmailInput,
    }

    function handleUpdate(path: (string | number)[], value: any) {
        updateProp(path, value)
    }

    function getValue(path: (string | number)[]) {
        if(!selectedComponent?.schema) return undefined;
        let target = selectedComponent.schema;
        for(const key of path) target = target?.[key];
        return target;
    }
</script>

<div class="p-4 flex flex-col w-full gap-6">

    {#if selectedComponent}
        <!-- Header -->
        <div class="space-y-2">
            <h3 class="text-xl font-bold capitalize text-primary">{selectedComponent.type} Properties</h3>
            {#if dev}
                <p class="text-xs text-gray-400 truncate">{selectedComponent.id}</p>
            {/if}
        </div>

        <!-- Properties -->
        <div class="space-y-4">
            {#each Object.entries(schemaDefinition) as [key, field]}
                {#if inputMap[field.type]}
                    <svelte:component
                        this={inputMap[field.type]}
                        label={field.label ?? key}
                        description={field.description}
                        value={getValue([key])}
                        schema={field}
                        inputMap={inputMap}
                        on:update={(event) => handleUpdate([key], event.detail)}
                        {field}  
                    />
                {:else}
                    <p class="text-sm text-gray-400 italic">
                        Unsupported field type: {field.type}
                    </p>
                {/if}
            {/each}
        </div>

    {:else}
        <p class="text-gray-500 italic text-center py-10">Nothing Selected</p>
    {/if}

</div>

<style>
    /* Optional: subtle hover effect for inputs */
    :global(.input-wrapper) {
        transition: transform 0.15s, box-shadow 0.15s;
    }
    :global(.input-wrapper:hover) {
        transform: translateY(-2px);
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
</style>
