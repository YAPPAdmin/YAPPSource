<script lang="ts">
    import { onMount } from "svelte";
    import { SchemaRegistry } from "./schemas";

    export let layout;
    let parsedValid: boolean = true;
    let parseError: any;
    let parsed: any;


    function getComponentFromType(type: string) {
        return SchemaRegistry[type]?.component;
    }

    $: mappedBlocks = (Array.isArray(layout)
        ? layout.map(block => ({
            ...block,
            component: getComponentFromType(block.type)
        }))
        : []) as any[];



    onMount(() => {
        console.log(mappedBlocks)
        
        // try {
        //     parsed = JSON.parse(layout);
        //     console.log(`Loading ${parsed.id}`)
        // } catch (err) {
        //     console.log(`Something went wrong while parsing this screen\n`)
        //     console.log(err)
        //     parseError = err;
        // }
    })

</script>


<div>
    {#if Array.isArray(layout)}

        {#each mappedBlocks as component}
            <svelte:component this={component.component} componentContent={component.schema} />
        {/each}

    {:else}
        <div class="mx-auto my-auto flex flex-col items-center justify-center text-center p-8">
            <h1 class="text-2xl font-semibold mb-2">Oops! Something went wrong.</h1>
            <p class="text-gray-600 mb-4">We couldn't load this page right now.</p>
            <p class="text-sm text-gray-500">Please try refreshing the page, or come back later.</p>
        </div>
    {/if}
</div>