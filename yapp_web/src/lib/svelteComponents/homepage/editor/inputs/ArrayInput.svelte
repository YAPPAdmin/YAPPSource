<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { slide } from "svelte/transition";
  import ImageInput from "./ImageInput.svelte";

    export let label: string;
    export let description: string | undefined = undefined;
    export let value: any[] | undefined = undefined;
    export let fieldDefault: any[] | undefined = undefined;
    export let itemSchema: any;

    $: if (!Array.isArray(value)) value = [];

    $: if (value == undefined) {
        value = fieldDefault ? JSON.parse(JSON.stringify(fieldDefault)) : [];
    } else if (!Array.isArray(value)) {
        value = [];
    }

    function generateDefaultItem() {
        if(itemSchema.type == "object" && itemSchema.schema) {
            const newItem: Record<string, any> = {};
            for(const [key, field] of Object.entries<any>(itemSchema.schema)) {
                newItem[key] = field.default != undefined ? field.default : (field.type == "string" ? "" : null);
            }

            return newItem;
        }
        return "";
    }

    function addItem() {
        value = [...value, generateDefaultItem()];
    }

    function removeItem(index: number) {
        value = value.filter((_, i) => i != index);
    }

    function moveItem(index: number, direction: -1 | 1) {
        if(index + direction < 0 || index + direction >= value.length) return;
        const newArr = [...value];
        const temp = newArr[index];
        newArr[index] = newArr[index + direction];
        newArr[index + direction ] = temp;
        value = newArr;
    }

    function triggerUpdate() {
        value = value;
    }

</script>

<div class="w-full flex flex-col gap-1.5">
    <div class="flex items-end justify-between">

        {#if label}
            <p class="block text-sm! font-semibold! text-gray-500!">{label}</p>
        {/if}

        <button 
            type="button" 
            on:click={addItem} 
            class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary-500 hover:text-primary-700 px-2 py-1 rounded transition-colors"
        >
            <Iconify iconId="material-symbols-light:add-2-rounded" height={16} />
            Add Item
        </button>
    </div>

    <div class="flex flex-col gap-3 w-full">
        {#each value as item, i (i)}
            <div 
                transition:slide={{ duration: 200 }}
                class="relative flex flex-col gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm group focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400 transition-all"
            >
                <div class="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex bg-white border border-gray-200 shadow-md rounded-md overflow-hidden z-10">
                    <button type="button" on:click={() => moveItem(i, -1)} class="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30" disabled={i == 0}>
                        <Iconify iconId="material-symbols-light:arrow-drop-up-rounded" height={16} />
                    </button>
                    <button type="button" on:click={() => moveItem(i, 1)} class="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 border-x border-gray-100 disabled:opacity-30" disabled={i == value.length - 1}>
                        <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" height={16} />
                    </button>
                    <button type="button" on:click={() => removeItem(i)} class="p-1 text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Iconify iconId="material-symbols-light:delete-outline-rounded" height={16} />
                    </button>
                </div>

                <span class="absolute -left-2 -top-2 w-5 h-5 flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-bold rounded-full shadow-sm">
                    {i + 1}
                </span>

                {#if itemSchema.type == "object" && itemSchema.schema}
                    <div class="grid gap-3 pt-1">
                        {#each Object.entries(itemSchema.schema) as [key, field]}
                            
                            {#if field.type == "string"}
                                <div class="flex flex-col gap-1">
                                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{field.label}</label>
                                    <input type="text" bind:value={value[i][key]} on:input={triggerUpdate} class="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" />
                                </div>
                            
                            {:else if field.type == "select"}
                                <div class="flex flex-col gap-1">
                                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{field.label}</label>
                                    <select bind:value={value[i][key]} on:change={triggerUpdate} class="w-full text-xs p-1.5 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-primary-500 outline-none">
                                        {#each field.options || [] as opt}
                                            <option value={opt}>{opt}</option>
                                        {/each}
                                    </select>
                                </div>

                            {:else if field.type === "image"}
                                <div class="flex flex-col gap-1 mt-2">
                                    <ImageInput 
                                        label={field.label} 
                                        bind:value={value[i][key]} 
                                    />
                                </div>
                            
                            {:else if field.type == "number"}
                                <div class="flex flex-col gap-1">
                                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{field.label}</label>
                                    <input type="number" bind:value={value[i][key]} on:input={triggerUpdate} class="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" />
                                </div>

                            {:else if field.type == "boolean"}
                                <label class="flex items-center gap-2 cursor-pointer mt-1">
                                    <input type="checkbox" bind:checked={value[i][key]} on:change={triggerUpdate} class="rounded text-primary-600 focus:ring-primary-500" />
                                    <span class="text-xs font-semibold text-gray-700">{field.label}</span>
                                </label>
                            {/if}

                        {/each}
                    </div>
                {:else}
                    <p class="text-xs text-red-500">Unsupported array item schema.</p>
                {/if}

            </div>
        {/each}
    </div>

    {#if value.length == 0}
        <div class="w-full border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400">
            <Iconify iconId="material-symbols-light:data-array-rounded" height={24} />
            <p class="text-xs mt-1">List is empty</p>
        </div>
    {/if}

    {#if description}
        <p class="text-xs text-gray-500 ml-1">{description}</p>
    {/if}
</div>