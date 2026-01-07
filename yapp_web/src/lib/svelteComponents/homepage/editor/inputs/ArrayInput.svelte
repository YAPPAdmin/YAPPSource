<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Component } from "svelte";
  import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
  import ObjectInput from "./ObjectInput.svelte";

  export let label: string;
  export let description: string;
  export let value: any[] = [];
  export let schema: any;
  export let path: (string | number)[] = [];
  export let inputMap: Record<string, typeof Component>;

  const dispatch = createEventDispatcher();

  function addItem() {
    let newItem: any;

    if (!schema.itemSchema) {
        newItem = "";
    } else if (schema.itemSchema.type === "object") {
        newItem = {};
    } else if (schema.itemSchema.type === "array") {
        newItem = [];
    } else if (schema.itemSchema.type === "boolean") {
        newItem = false;
    } else {
        newItem = "";
    }

    dispatch("update", [...value, newItem]);
  }

  function removeItem(index: number) {
    const newArr = value.filter((_, i) => i !== index);
    dispatch("update", newArr);
  }

    function handleChildUpdate(index: number, val: any) {
        const newArr = value.map((v, i) => i === index ? val : v);
        dispatch("update", newArr);
    }
</script>

<div class="space-y-2 flex flex-col">
    <p class="block text-sm capitalize font-medium mb-2">{label}</p>

    <Tooltip text={description}>
        <div class="space-y-2">
        {#each value ?? [] as item, index (index)}
            <div class="p-3 border border-gray-300 transition-all duration-500 shadow hover:shadow-xl rounded-xl flex flex-col gap-2">
                {#if schema && schema.itemSchema}
                    {#if schema.itemSchema.type === "object"}
                        <ObjectInput
                            schema={schema.itemSchema.schema ?? {}}
                            value={item}
                            path={[...path, index]}
                            {inputMap}
                            on:update={(event) => handleChildUpdate(index, event.detail)}
                        />
                    {:else}
                        <svelte:component
                            this={inputMap[schema.itemSchema.type]}
                            label={schema.itemSchema.label ?? index}
                            description={schema.itemSchema.description}
                            value={item}
                            schema={schema.itemSchema.schema ?? schema.itemSchema} 
                            options={schema.itemSchema.options}
                            inputMap={inputMap}
                            on:update={(e) => handleChildUpdate(index, e.detail)}
                            path={[...path, index]}
                        />
                    {/if}
                {:else}
                    <p class="text-sm text-gray-400 italic">Unsupported array item type</p>
                {/if}

                <button class="mx-auto defaultButton !p-1 !bg-error-default hover:bg-error-light" on:click={() => removeItem(index)}>Remove</button>
            </div>
        {/each}
        </div>
    </Tooltip>

  <button type="button" class="mt-1 defaultButton !p-1" on:click={addItem}>+ Add</button>
</div>
