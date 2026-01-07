<script lang="ts">
    export let components;
    export let addComponent: (type: string) => void;
</script>

<!-- Component Palette -->
<div>
    <p>Component Palette</p>

    {#if components}
        <div class="flex flex-col">
            {#each Object.keys(components) as component}
                <button class="defaultButton capitalize" on:click={() => addComponent(component)}>
                    Add {component}
                </button>
            {/each}
        </div>
    {/if}
</div>