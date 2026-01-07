<script lang="ts">
  import Iconify from "../iconify/Iconify.svelte";

    export let content: any[] = [];
    export let selectable: boolean = false;
    export let defaultVisibleColumns: string[] = []

    const allColumns = Object.keys(content[0])


    // Initialize visibleColumns after content is available
    $: visibleColumns = defaultVisibleColumns.length > 0 
    ? [...defaultVisibleColumns]
    : content.length > 0 
        ? Object.keys(content[0])
        : [];

    let searchTerm = "";

    // Create reactive filtered content
    $: filteredContent = searchTerm
    ? content.filter(item => {
        // Convert the item to a string representation
        const itemString = JSON.stringify(item).toLowerCase();
        return itemString.includes(searchTerm.toLowerCase());
    })
    : content;


    
    // Filter for row filter, not search
    let showFilter = false;

    function toggleFilter() {
        showFilter = !showFilter;
    }


    // Format function unchanged
    function formatValue(value: any): string {

        // Format Arrays - put , between listings
        if (Array.isArray(value)) return value.join(", ");

        // Format dates
        if (value instanceof Date) return value.toLocaleDateString();

        // Format Booleans
        if (typeof value === "boolean") return value ? "Yes" : "No";

        // Format Objects
        if (typeof value === "object" && value !== null) return JSON.stringify(value);

        return String(value);
    }

    function addIconToHeader(header: string): string {
        switch(header) {
            case "likes": 
                return "material-symbols-light:thumb-up-outline-sharp"
            
            case "dislikes": 
                return "material-symbols-light:thumb-down-outline-sharp"
            
            case "like": 
                return ""
            
            default:
                return "";
            
        }
    }

</script>


<!-- https://preline.co/docs/tables.html -->
<div class="flex flex-col">
    <div class="-m-1.5 overflow-x-auto">
        <div class="p-1.5 min-w-full inline-block align-middle">
            <div class="border border-gray-200 rounded-lg divide-y divide-gray-200">
                
                <!-- Searchbar/Filter -->
                <div class="py-3 px-4 flex items-center gap-x-3 w-full max-w-md">
                        
                    <!-- Searchbar -->
                    <label for="searchbar" class="sr-only">Search</label>
                    <input
                        class="py-1.5 sm:py-2 px-3 ps-9 block w-full border-gray-200 shadow-2xs rounded-lg sm:text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                        type="text"
                        id="searchbar"
                        placeholder="Search for items"
                        bind:value={searchTerm}
                    />
                                        

                    <div class="relative inline-block text-left">
                        <!-- Filter -->
                        <button on:click={toggleFilter} class="border border-gray-200 rounded-lg p-2 bg-background-900 shadow-lg hover:bg-background-800 ">
                            <Iconify iconId={"material-symbols-light:filter-alt-outline"} button={true}/>
                        </button>

                        <!-- Filter Dropdown -->
                        {#if showFilter}
                            <div class="flex flex-col absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white p-4 space-y-2 uppercase">
                                {#each allColumns as column}
                                    <label class="">
                                        <input
                                            class="!w-auto !h-auto !p-0 !m-0 !bg-transparent !border-none !shadow-none !inline !align-middle"
                                            type="checkbox"
                                            checked={visibleColumns.includes(column)}
                                            on:click={() => {
                                                if (visibleColumns.includes(column)) {
                                                    visibleColumns = visibleColumns.filter(col => col !== column);
                                                } else {
                                                    visibleColumns = [...visibleColumns, column];
                                                }
                                            }}
                                        />
                                        {column}
                                    </label>
                                {/each}
                            </div>
                        {/if}
                    </div>  
                </div>

                <!-- Table -->
                <div class="overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">

                        <!-- Headers -->
                        <thead class="bg-background-800">
                            <tr>
                                {#if selectable}
                                    <th scope="col" class="py-3 px-4 pe-0">
                                        <div class="flex items-center h-5">
                                            <input id="hs-table-pagination-checkbox-all" type="checkbox" class="border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500">
                                            <label for="hs-table-pagination-checkbox-all" class="sr-only">Checkbox</label>
                                        </div>
                                    </th>
                                {/if}

                                {#each allColumns as column}
                                    {#if visibleColumns.includes(column)}
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 uppercase">
                                            {column}
                                        </td>
                                    {/if}
                                {/each}
                            </tr>
                        </thead>

                        <!-- Body -->
                        <tbody class="divide-y divide-gray-200">
                            {#if filteredContent.length === 0}

                                <!-- No Data Error -->
                                <tr>
                                    <td colspan={visibleColumns.length} class="text-center p-4 text-gray-400">
                                        No data available
                                    </td>
                                </tr>

                            {:else}

                                {#each filteredContent as item}
                                    <tr class="odd:bg-white even:bg-background-800 hover:bg-background-900 ">
                                        
                                        <!-- Select -->
                                        {#if selectable}
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 ">
                                                <input type="checkbox" />
                                            </td>
                                        {/if}

                                        <!-- Column -->
                                        {#each allColumns as column}
                                            {#if visibleColumns.includes(column)}
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 ">
                                                    {formatValue(item[column])}
                                                </td>
                                            {/if}
                                        {/each}
                                    </tr>
                                {/each}
                            {/if}

                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="py-1 px-4">
                <nav class="flex items-center space-x-1" aria-label="Pagination">
                    <button type="button" class="p-2.5 min-w-10 inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" aria-label="Previous">
                    <span aria-hidden="true">«</span>
                    <span class="sr-only">Previous</span>
                    </button>
                    <button type="button" class="min-w-10 flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none" aria-current="page">1</button>
                    <button type="button" class="min-w-10 flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none">2</button>
                    <button type="button" class="min-w-10 flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none">3</button>
                    <button type="button" class="p-2.5 min-w-10 inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" aria-label="Next">
                    <span class="sr-only">Next</span>
                    <span aria-hidden="true">»</span>
                    </button>
                </nav>
                </div>

            </div>
        </div>
    </div>
</div>