<script lang="ts">
    import { fly } from "svelte/transition";
    export let open = false;
    export let position: "left" | "right" | "centered" = "centered"; // Default position is center

    let activeClass = "absolute z-50 rounded-md shadow-md bg-primary/30 backdrop-blur-md"
    let transparent: boolean = true;

    $: activeClass = (() => {
        const base = "absolute z-50 rounded-md shadow-md bg-primary/30 backdrop-blur-md";
        
         const bg = transparent
            ? "bg-primary/30 backdrop-blur-md"
            : "bg-primary text-primary-foreground";

        if (position === "left") {
            return `${base} left-0`;
        } else if (position === "right") {
            return `${base} right-0`;
        } else if (position === "centered") {
            return `${base} left-1/2 -translate-x-1/2 transform`;
        }
        return base;
    })();

</script>

<button
    class="relative inline-block"
    aria-expanded={open}
    aria-haspopup="menu"
    tabindex="0"
    on:mouseenter={() => open = true}
    on:mouseleave={(e) => {
        const dropdown = e.currentTarget.nextElementSibling;
        if (!dropdown || !dropdown.contains(e.relatedTarget)) {
            open = false;
        }
    }}
    on:click={() => open = !open}
    on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
            open = !open;
        }
    }}
>
    <span class="relative inline-block p-5 -m-5">
        <slot></slot>
    </span>

    {#if open}
        <div
            class={activeClass}

            in:fly={{ y: 0, duration: 300 }}
            out:fly={{ y: 0, duration: 300 }}
        >
            <div role="menu">
                <slot name="content"></slot>
            </div>
        </div>
    {/if}
</button>
