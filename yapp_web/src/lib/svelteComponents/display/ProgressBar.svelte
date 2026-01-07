<script lang="ts">
    export let value: number = 0;
    export let lowerEnd: number = 0;
    export let higherEnd: number = 100;

    $: formatedValue = `width: ${value}%`
    $: formatedValueCalc = `width: ${(lowerEnd / higherEnd) * 100}%`

</script>

<!-- https://preline.co/docs/progress.html -->
{#if value && lowerEnd && higherEnd}
    <div class="flex w-full h-1.5 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
        <div class="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition duration-500" style={formatedValueCalc}></div>
    </div>
{:else if value}
    <div class="flex w-full h-1.5 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
        <div class="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition duration-500" style={formatedValue}></div>
    </div>
{:else}
    <p>No Input for Progress Bar</p>
{/if}