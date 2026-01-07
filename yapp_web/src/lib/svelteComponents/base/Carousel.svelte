<script lang="ts">
    import { onMount } from 'svelte';
    import Iconify from '../iconify/Iconify.svelte';

    export let content: { component: typeof import("svelte").SvelteComponent; props: any }[];


    let isClient = false;
    onMount(() => {
        isClient = true;
    });

</script>

{#if isClient}
    <ul class="flex overflow-x-auto snap-x snap-mandatory gap-6 px-8">
        {#each content as { component, props } (props.blogPost?.id)}
            <li class="shrink-0 snap-center">
                <svelte:component this={component} {...props} />
            </li>
        {/each}
    </ul>
{/if}


<!-- snap-x snap-mandatory before:shrink-0 before:w-[30vw]  after:shrink-0 after:w-[30vw] -->