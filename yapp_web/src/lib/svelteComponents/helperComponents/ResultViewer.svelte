<script lang="ts">
    export let data: any;
    export let name: string | null = null;

    let expanded = false;

    // Helper to determine if a node is expandable
    const isExpandable = typeof data === 'object' && data !== null && Object.keys(data).length > 0;
</script>

<div class="ml-4">
    {#if isExpandable}

        <button class="cursor-pointer select-none" on:click={(() => {expanded = !expanded})}>
            <span class="font-bold text-primary-500 font-mono">
                {expanded ? '+' : '-'} {name ? name : Array.isArray(data) ? '[Array]' : '[Object]'}
            </span>
        </button>

    {#if expanded}
        <div class="ml-4 text-secondary-500">
            {#if Array.isArray(data)}

                {#each data as item, i}
                    <svelte:self name={`[${i}]`} data={item} />
                {/each}

            {:else}

                {#each Object.entries(data) as [key, value]}
                    <svelte:self name={key} data={value} />
                {/each}

            {/if}
        </div>
    {/if}

    {:else}
        <div class="flex gap-2 items-start">
            {#if name}
                <span class="font-semibold">{name}: </span>
            {/if}
            <span class="text-gray-700 hover:text-gray-600 font-mono ml-2">
                {#if String(data)}
                    {String(data)}
                {:else}
                    <p>-</p>
                {/if}
            </span>
        </div>
    {/if}
</div>
