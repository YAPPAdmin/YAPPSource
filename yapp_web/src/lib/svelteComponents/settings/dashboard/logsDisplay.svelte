<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { dev } from "$app/environment";
    import { popupStack } from "$lib/popups/popup";
  import LogsChartDisplay from "./LogsChartDisplay.svelte";

    const levelColors: Record<string, string> = {
        INFO: "text-cyan-600 bg-cyan-600",
        WARN: "text-warning-default bg-warning-default",
        ERROR: "text-error-default bg-error-default",
        SECURITY: "text-error-default bg-error-default",
        CRIT: "text-violet-500 bg-violet-500",
    };

    const sourceColors: Record<string, string> = {
        "AUTH": "text-violet-500 bg-violet-100",
        "DB": "text-emerald-600 bg-emerald-100",
        "SYSTEM": "text-gray-700 bg-gray-200",
        "UI": "text-blue-500 bg-blue-100",
        "API": "text-orange-500 bg-orange-100",
        "WORKER": "text-green-600 bg-green-100"
    };


    export let logs: any[] = [];

    let currentPage = 1;
    let limit = 100;
    export let total;

    let searchSource: "DB" | "SYSTEM" | "API" | string | undefined = undefined;  
    let searchLevel: "INFO" | "WARN" | "ERROR" | "SECURITY" | "CRIT" | undefined = undefined;

    let searchQuery:string = "";

    $: totalPages = Math.ceil(total / limit) || 1; // Ensure minimum of 1 page

    $: pages = Array.from(
    { length: totalPages }, 
    (_, i) => i + 1
    );

    $: visiblePages = (() => {
        const delta = 2; // number of pages to show before/after current
        const range: (number | string)[] = [];
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);

        if (left > 1) {
            range.push(1);
            if (left > 2) range.push("…"); // gap before left
        }

        for (let i = left; i <= right; i++) {
            range.push(i);
        }

        if (right < totalPages) {
            if (right < totalPages - 1) range.push("…"); // gap after right
            range.push(totalPages);
        }

        return range;
    })();

    let localSearchResults = logs;
    let dbSearchResults: any[] = [];
    let dbSearchResultsTotal: number | undefined = undefined;
    let debounceTimeout: ReturnType<typeof setTimeout>;

    let loading = false;

    let DEVisPopulating = false;

    export async function fetchLogs(newPage: number) {
        if(newPage < 1 ||newPage > totalPages) return;

        console.log("FETCH")

        loading = true;
        let result;

        try {
            result = await fetch(`/api/logs?page=${newPage}&limit=${limit}`)
            const data = await result.json()

            localSearchResults = data.result;
            currentPage = newPage

            console.log(data)

            return data.result

        } catch {

        } finally {
            loading = false 
        }
    }

    export async function changeLimit(newLimit: number) {
        limit = newLimit;
        currentPage = 1;
        searchQuery = "";
        localSearchResults = [];
        dbSearchResults = []

        await fetchLogs(currentPage);
    }   

    export async function searchLogs() {
        if(!searchQuery || searchQuery.trim().length == 0) return;

        // Local Search Results
        localSearchResults = logs.filter((log) => (
            log.error.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user?.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        ));

        // Clear Previous Timer
        clearTimeout(debounceTimeout)

        // Start new Timer
        debounceTimeout = setTimeout(async () => {
            
            console.log("SEARCHING DB")
            
            try {
                let filter: Record<string, string> = {
                    ...(searchSource ? {source: searchSource} : {}),
                    ...(searchLevel ? {level: searchLevel} : {})
                };

                const search = {
                    "message": searchQuery,
                    "error": searchQuery,
                    "user.email": searchQuery,
                    "user.id": searchQuery,
                }

                const result = await fetch(`/api/logs?page=${0}&limit=${0}&filter=${JSON.stringify(filter)}&search=${JSON.stringify(search)}`)
                const data = await result.json();

                dbSearchResults = data.result;

            } catch (err) {
                console.error("DB SEARCH FAILED", err);
            }
        }, 1000);
    }

  


    async function DEVPopulateDB() {
        if(!dev) return;

        console.log("[DEV] Populate DB")

        DEVisPopulating = true;

        try{
            const result = await fetch("/api/dev/logs/", { method: "POST" });
            const data = await result.json();

            if(data.success) {
                popupStack.open({
                    type: "text",
                    title: "Finished Populating",
                    message: "Finished Populating Logs Database. Reload Page for updated display",
                    variant: "toast",
                })
            }

        } catch(err) {
            popupStack.open({
                type: "text",
                title: "Error Populating",
                message: "An Error occured while Populating Logs Database.",
                variant: "toast",
            });

        }finally  {
            DEVisPopulating = false;
        }

    }

</script>

{#if logs}
    <div class="flex flex-col max-w-120 overflow-x-auto min-w-full align-middle border border-gray-200 rounded-lg divide-y divide-gray-200">
    
        <!-- <LogsChartDisplay logs={localSearchResults}/> -->

        <!-- Searchbar -->
        <div class="py-3 px-4 flex items-center gap-x-2">
            <div class="flex items-center">
                <label class="sr-only" for=searchbar>Search</label>

                <input type="text" bind:value={searchQuery} on:input={searchLogs} placeholder={"Search through Logs"} class="py-1.5 sm:py-2 px-3 ps-9 block w-full border-gray-200 !shadow-2xs rounded-lg sm:text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none">

                <Iconify iconId={"material-symbols-light:search-rounded"} />
            </div>

            <div>
                {#if dev}
                    <button class="DEVbutton" disabled={DEVisPopulating} on:click={DEVPopulateDB}>                  
                        Fill DB

                        {#if DEVisPopulating} 
                            <div class=" ml-4 animate-spin inline-block size-6 border-3 border-current border-t-transparent text-cyan-600 rounded-full">
                                <span class="sr-only">Loading...</span>
                            </div>
                        {/if}
                    </button>
                {/if}
            </div>

        </div>

        <!-- Pagination and Limit-->
        <div class="flex justify-between items-center py-1 px-4 ">
            <nav class="flex items-center space-x-1" aria-label="Pagination">

                <!-- Previous -->
                <button on:click={(() => fetchLogs(currentPage-1))} type="button" class="p-2.5 min-w-10 inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" aria-label="Previous">
                    <span aria-hidden="true">«</span>
                    <span class="sr-only">Previous</span>
                </button>

                <!-- Numbers -->
                {#each visiblePages as page}
                    {#if page === "…"}
                        <span class="min-w-10 flex justify-center items-center py-2.5 text-sm text-gray-400">…</span>
                    {:else if page === currentPage}
                        <p class="min-w-10 flex justify-center items-center text-gray-800 bg-secondary-700 hover:bg-secondary-800 focus:outline-hidden focus:bg-secondary-800 py-2.5 text-sm rounded-full">{page}</p>
                    {:else}
                        <button on:click={() => fetchLogs(page)} type="button" class="min-w-10 flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 py-2.5 text-sm rounded-full">
                            {page}
                        </button>
                    {/if}
                {/each}

            
                <!-- Next -->
                <button on:click={fetchLogs(currentPage+1)} type="button" class="p-2.5 min-w-10 inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none " aria-label="Next">
                    <span class="sr-only">Next</span>
                    <span aria-hidden="true">»</span>
                </button>

            </nav>

            <div class="text-blue-500">
                <p class="!text-gray-400 text-md">Showing {localSearchResults.length} of {total} entries</p>
            </div>

            <div>
                <select id="limitSelect" bind:value={limit} on:change={() => changeLimit(limit)}>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                </select>
            </div>

        </div>

        <!-- Table -->
        <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200 ">

                <!-- Head -->
                <thead class="bg-gray-50 ">
                    <tr>

                        <th scope="col" class="py-3 px-4 pe-0">
                            <div class="flex items-center h-5">
                                <input id="hs-table-pagination-checkbox-all" type="checkbox" class="border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500 ">
                                <label for="hs-table-pagination-checkbox-all" class="sr-only">Checkbox</label>
                            </div>
                        </th>

                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase ">Time</th>
                        
                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Source</th>
                        
                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase ">Level</th>
                        
                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase ">Message</th>

                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase ">User</th>

                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase ">Context</th>

                        
                    </tr>
                </thead>

                <!-- Body -->
                <tbody class="divide-y divide-gray-200">

                    {#if loading}
                        {#each Array(limit) as _} <!-- Simulate 5 skeleton rows -->
                            <tr class="animate-pulse">
                                <!-- Checkbox -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    <div class="flex items-center h-5">
                                        <span class="block w-4 h-4 bg-gray-200 rounded-sm"></span>
                                    </div>
                                </td> 

                                <!-- Timestamp -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    <span class="block h-4 w-20 bg-gray-200 rounded-full"></span>
                                </td>

                                <!-- Source -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span class="block h-4 w-16 bg-gray-200 rounded-full"></span>
                                </td>

                                <!-- Level -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    <span class="block h-4 w-12 bg-gray-200 rounded-full"></span>
                                </td>

                                <!-- Message -->
                                <td class="px-6 py-4 whitespace-normal text-sm text-gray-800 max-w-xs">
                                    <span class="block h-4 w-full bg-gray-200 rounded-full mb-1"></span>
                                    <span class="block h-4 w-3/4 bg-gray-200 rounded-full"></span>
                                </td>

                                <!-- User -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    <span class="block h-4 w-20 bg-gray-200 rounded-full"></span>
                                </td>

                                <!-- Content -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    <span class="block h-4 w-20 bg-gray-200 rounded-full"></span>
                                </td>
                            </tr>
                        {/each}

                    {:else}
                        {#each localSearchResults as log, index }
                            <tr class={`px-2 py-1 rounded-full bg-${levelColors[log.level]}/50`}>

                                <!-- Checkbox -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    <div class="flex items-center h-5">
                                        <input id="hs-table-pagination-checkbox-1" type="checkbox" class="border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500 ">
                                        <label for="hs-table-pagination-checkbox-1" class="sr-only">Checkbox</label>
                                        <p>{index+1}</p>
                                    </div>
                                </td>

                                <!-- Timestamp -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                    {log.timestamp}
                                </td>
                                
                                <!-- Source -->
                                <td class="px-6 py-4 whitespace-nowrap ont-semibold text-sm">
                                    <span class={`px-2 py-1 rounded-full   ${sourceColors[log.source]}`}>
                                        {log.source} 
                                    </span>
                                </td>
                                
                                <!-- Level -->
                                <td class="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-800">
                                    <span class={`px-2 py-1 rounded-full !text-white ${levelColors[log.level]}`}>
                                        {log.level}
                                    </span>
                                </td>
                                
                                <!-- Message -->
                                <td class="px-6 py-4 whitespace-normal text-sm font-medium text-gray-800 max-w-xs">
                                    <span class={`px-2 py-1 rounded-full bg-opacity-10 !bg-white ${levelColors[log.level]}`}>
                                        {log.message}
                                    </span>
                                </td>

                                <!-- User -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {#if log.user}
                                        {#if log.user.id}
                                            <span>{log.user.id}</span>
                                        {/if}

                                        {#if log.user.email}
                                            <span class="text-gray-500 text-xs">({log.user.email})</span>
                                        {/if}
                                    {:else}
                                        <span class="italic text-gray-400">No User</span>
                                    {/if}
                                </td>

                                <!-- Content -->
                                <td class="px-6 py-4 whitespace-normal text-sm text-gray-800">
                                    {#if log.context && Object.keys(log.context).length > 0}
                                        <ul class="text-xs text-gray-500 space-y-0.5">
                                        {#each Object.entries(log.context) as [key, value]}
                                            <li>
                                            <strong>{key}:</strong>
                                            {#if typeof value === 'object'}
                                                <pre class="inline">{JSON.stringify(value)}</pre>
                                            {:else}
                                                {value}
                                            {/if}
                                            </li>
                                        {/each}
                                        </ul>
                                    {:else}
                                        <span class="italic text-gray-400">No Context</span>
                                    {/if}
                                </td>

                            </tr>
                        {/each}

                        {#if dbSearchResults}
                            <tr class={`px-2 py-1 rounded-full`}>
                                <td class="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-800">
                                    All Results
                                </td>
                            </tr>

                            {#each dbSearchResults as log, index }
                                <tr class={`px-2 py-1 rounded-full bg-${levelColors[log.level]}/50`}>

                                    <!-- Checkbox -->
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                        <div class="flex items-center h-5">
                                            <input id="hs-table-pagination-checkbox-1" type="checkbox" class="border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500 ">
                                            <label for="hs-table-pagination-checkbox-1" class="sr-only">Checkbox</label>
                                            <p>{index+1}</p>
                                        </div>
                                    </td>

                                    <!-- Timestamp -->
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                        {log.timestamp}
                                    </td>
                                    
                                    <!-- Source -->
                                    <td class="px-6 py-4 whitespace-nowrap ont-semibold text-sm">
                                        <span class={`px-2 py-1 rounded-full   ${sourceColors[log.source]}`}>
                                            {log.source} 
                                        </span>
                                    </td>
                                    
                                    <!-- Level -->
                                    <td class="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-800">
                                        <span class={`px-2 py-1 rounded-full !text-white ${levelColors[log.level]}`}>
                                            {log.level}
                                        </span>
                                    </td>
                                    
                                    <!-- Message -->
                                    <td class="px-6 py-4 whitespace-normal text-sm font-medium text-gray-800 max-w-xs">
                                        <span class={`px-2 py-1 rounded-full bg-opacity-10 !bg-white ${levelColors[log.level]}`}>
                                            {log.message}
                                        </span>
                                    </td>

                                    <!-- User -->
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        {#if log.user}
                                            {#if log.user.id}
                                                <span>{log.user.id}</span>
                                            {/if}

                                            {#if log.user.email}
                                                <span class="text-gray-500 text-xs">({log.user.email})</span>
                                            {/if}
                                        {:else}
                                            <span class="italic text-gray-400">No User</span>
                                        {/if}
                                    </td>

                                    <!-- Content -->
                                    <td class="px-6 py-4 whitespace-normal text-sm text-gray-800">
                                        {#if log.context && Object.keys(log.context).length > 0}
                                            <ul class="text-xs text-gray-500 space-y-0.5">
                                            {#each Object.entries(log.context) as [key, value]}
                                                <li>
                                                <strong>{key}:</strong>
                                                {#if typeof value === 'object'}
                                                    <pre class="inline">{JSON.stringify(value)}</pre>
                                                {:else}
                                                    {value}
                                                {/if}
                                                </li>
                                            {/each}
                                            </ul>
                                        {:else}
                                            <span class="italic text-gray-400">No Context</span>
                                        {/if}
                                    </td>

                                </tr>
                            {/each}
                        {/if}
                    {/if}



                </tbody>
            </table>
        </div>

        <!-- Pagination and Limit-->
        <div class="flex justify-between items-center py-1 px-4 ">
            <nav class="flex items-center space-x-1" aria-label="Pagination">

                <!-- Previous -->
                <button on:click={(() => fetchLogs(currentPage-1))} type="button" class="p-2.5 min-w-10 inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" aria-label="Previous">
                    <span aria-hidden="true">«</span>
                    <span class="sr-only">Previous</span>
                </button>

                <!-- Numbers -->
                {#each visiblePages as page}
                    {#if page === "…"}
                        <span class="min-w-10 flex justify-center items-center py-2.5 text-sm text-gray-400">…</span>
                    {:else if page === currentPage}
                        <p class="min-w-10 flex justify-center items-center text-gray-800 bg-secondary-700 hover:bg-secondary-800 focus:outline-hidden focus:bg-secondary-800 py-2.5 text-sm rounded-full">{page}</p>
                    {:else}
                        <button on:click={() => fetchLogs(page)} type="button" class="min-w-10 flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 py-2.5 text-sm rounded-full">
                            {page}
                        </button>
                    {/if}
                {/each}

            
                <!-- Next -->
                <button on:click={fetchLogs(currentPage+1)} type="button" class="p-2.5 min-w-10 inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none " aria-label="Next">
                    <span class="sr-only">Next</span>
                    <span aria-hidden="true">»</span>
                </button>

            </nav>

            <div class="text-blue-500">
                <p class="!text-gray-400 text-md">Showing {localSearchResults.length} of {total} entries</p>
            </div>

            <div>
                <select id="limitSelect" bind:value={limit} on:change={() => changeLimit(limit)}>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                </select>
            </div>

        </div>

    </div>
{/if}