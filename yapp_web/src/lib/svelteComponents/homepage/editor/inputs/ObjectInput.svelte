<script lang="ts">
    import { createEventDispatcher } from "svelte";    
    import type { Component } from "svelte";


    export let label: string;
    export let description: string;
    export let value: Record<string, any>;
    export let schema: Record<string, any>;
    export let path: (string | number)[] = [];
    export let inputMap: Record<string, typeof Component>

    const dispatch = createEventDispatcher();


    function handleFieldUpdate(fieldKey: string, newValue: any) {
        const updated = { ...value, [fieldKey]: newValue };
        dispatch("update", updated);
    }
</script>

<div class="space-y-2">
    {#each Object.entries(schema) as [childKey, childField]}
        <svelte:component
            this={inputMap[childField.type]}
            label={childField.label ?? childKey}
            description={childField.description}
            value={value?.[childKey]}
            schema={childField.schema ?? childField}
            options={childField.options}
            inputMap={inputMap}
            on:update={(event) => handleFieldUpdate(childKey, event.detail)}
            path={[...path, childKey]}
        />
    {/each}
</div>
