<script lang="ts">
    import Icon, { iconLoaded, loadIcons, type IconifyIconLoaderAbort } from '@iconify/svelte';
    import { onDestroy } from 'svelte';

    export let iconId: string = "material-symbols-light:bug-report-outline-rounded";
    export let height: number = 24;
    export let inline: boolean = true;
    export let style: string = "color: text-primary-500";
    export let button: boolean = false;


    $: iconClass = `${style} ${button ? 'hover:text-primary-700 cursor-pointer transition-colors duration-200' : ''}`;

    // Icon status and cleanup function
    let loaded: boolean = false;
    let cleanup: IconifyIconLoaderAbort | null = null;

    // Reactive statement to load the icon
    $: {
        loaded = iconLoaded(iconId);

        if (!loaded) {
        if (cleanup) {
            cleanup();
        }
        cleanup = loadIcons([iconId], () => {
            loaded = true; // Update loaded status after icon is loaded
        });
        }
    }

    // Cleanup
    onDestroy(() => {
        if (cleanup) {
            cleanup();
        }
    });
</script>

{#if loaded}
    <Icon icon={iconId} height={height} inline={inline} style={style} class={iconClass + " shrink-0"}/>
{:else}
    <div class="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-primary-500 rounded-full" >
        <span class="sr-only">Loading...</span>
    </div>
{/if}
