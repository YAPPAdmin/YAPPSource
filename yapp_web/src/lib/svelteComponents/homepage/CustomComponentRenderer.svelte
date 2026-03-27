<script lang="ts">
    import { BlockRegistry } from "./utils/BlocksRegistry";
    import UnknownBlock from "./modules/UnknownBlock.svelte";
  import type { PageLayoutVersion } from "$lib/utils/pageEditor/PageLayoutVersion";

    export let version: PageLayoutVersion | undefined;
    console.log(version)
    console.log(version?.blocks)
    console.log(version?.blocks.length)

</script>


<div class="w-full h-full my-10 p-2">
    {#if version && version.blocks && version.blocks.length > 0}
        {#each version.blocks as block (block.id)}
            <svelte:component 
                this={BlockRegistry[block.type]?.component || UnknownBlock} 
                content={block.content} 
                settings={block.settings} 
            />
        {/each}
    {:else}
        <p class="text-gray-500 text-center py-10">This page has no content yet.</p>
    {/if}
</div>