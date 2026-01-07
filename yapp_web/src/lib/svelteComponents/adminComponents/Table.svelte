<script lang="ts">
    export let headers: string[];
    export let content: any;
    export let firstColumnHighlight: Boolean = true;
</script>




<!-- P Table -->
<!-- https://preline.co/docs/tables.html -->
<div class="flex flex-col">
    <div class="-m-1.5 overflow-x-auto">
      <div class="p-1.5 min-w-full inline-block align-middle">
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">

            <thead>
                <tr>
                    {#each headers as header}
                        <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{header}</th>
                    {/each}
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">

                {#each content as entry}
                    <tr>
                        {#each Object.keys(entry) as key, index}
                            <td class="{index === 0 && firstColumnHighlight ? 'highlight' : ''}">{entry[key]}</td>
                        {/each}
                    </tr>
                {/each}



            </tbody>
          </table>
        </div>
      </div>
    </div>
</div>


<style>
    .highlight {
        @apply
        px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800
        ;
    }

    td {
        @apply
        px-6 py-4 whitespace-nowrap text-sm text-gray-800
        ;
    }


</style>






<!--   
    <tr>
    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Joe Black</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">31</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Sidney No. 1 Lake Park</td>
    <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
        <button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-none focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">Delete</button>
    </td>
    </tr>
 -->
