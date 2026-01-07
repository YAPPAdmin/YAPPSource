<script lang="ts">
  import { fade } from "svelte/transition";


    export let text: string;
    export let placement: "top" | "bottom" | "left" | "right" = "bottom";
    export let hovertime: number = 1000;
    export let condition: boolean = true;
    export let fullWidth: boolean = false;
    
    let isVisible = false;
    let hoverTimeout: ReturnType<typeof setTimeout>;

    function handleMouseEnter() {
        hoverTimeout = setTimeout(() => {
        isVisible = true;
        }, hovertime);
    }

    function handleMouseLeave() {
        clearTimeout(hoverTimeout);
        isVisible = false;
    }

</script>

<!-- https://preline.co/docs/tooltip.html -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class={`relative ${fullWidth ? "block w-full" : "inline-block"}`}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:focus={handleMouseEnter}
    on:blur={handleMouseLeave}
>
    <slot />

    {#if isVisible && condition}
        <div
            transition:fade={{ duration: 150 }}
            class={`absolute w-full z-10 px-2 py-1 text-xs font-medium text-white bg-gray-900 
                rounded-md shadow-2xs whitespace-nowrap transition-opacity duration-200
                ${placement === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-1' : ''}
                ${placement === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-1' : ''}
                ${placement === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-1' : ''}
                ${placement === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-1' : ''}`}
            role="tooltip"
        >
            {text}
        </div>
    {/if}
</div>