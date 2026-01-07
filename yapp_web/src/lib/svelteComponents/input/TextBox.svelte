<script lang="ts">
    export let editable: boolean = false;
    export let value: string = "";
    export let placeholder: string = "This is a textarea placeholder";
    export let rows: number = 3;
</script>

<div class="max-w-sm space-y-3">
    {#if editable}
        <textarea
            bind:value
            class="py-2 px-3 sm:py-3 sm:px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
            rows={rows}
            placeholder={placeholder}
        />
    {:else}
        <div
            class="py-2 px-3 sm:py-3 sm:px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
        >
            {value}
        </div>
    {/if}
</div>
