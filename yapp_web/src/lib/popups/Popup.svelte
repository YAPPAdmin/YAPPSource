<script lang="ts">
    import { popupStack } from "./popup";
    import { fly, fade } from "svelte/transition";
    
    // $: current = stack.at(-1);
    // $: popupStack.subscribe(v => stack = v)
    $: current = $popupStack.at(-1);

</script>

{#if current}
    <!-- Toast -->
    {#if current.variant == "toast"}
        <div class="fixed bottom-4 right-4 z-50 max-w-sm" transition:fly={{ y: 20, duration: 200 }}>
            <div class="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
                <!-- Text Popup -->
                {#if current.type == "text"}
                    <!-- Heading -->
                    {#if current.title}
                        <h2>{current.title}</h2>
                    {/if}

                    <!-- Text Message -->
                    <p class="whitespace-pre-line">{current.message}</p>

                    <div class="flex justify-end gap-2 mt-10">
                        {#if current.buttons}
                            {#each current.buttons as btn}
                            <button
                                class="px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700"
                                on:click={() => { btn.action(); popupStack.close(); }}
                            >
                                {btn.label}
                            </button>
                            {/each}
                        {/if}

                        <button class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" on:click={popupStack.close}>
                            {#if current.closeText}
                                {current.closeText}
                            {:else}
                                Close
                            {/if}
                        </button>
                    </div>

                {:else if current.type == "component"}
                    <svelte:component this={current.component} {...current.props} />
                {/if}
            </div>
        </div>
    
    <!-- Modal -->
    {:else if current.variant == "modal"}
        <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50" transition:fade>
            <div class="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md" transition:fly={{ y: 20 }}>
                <!-- Text Popup -->
                {#if current.type == "text"}

                    <!-- Heading -->
                    {#if current.title}
                        <h2>{current.title}</h2>
                    {/if}

                    <!-- Text Message -->
                    <p class="whitespace-pre-line">{current.message}</p>

                    <div class="flex justify-end gap-2 mt-10">
                        {#if current.buttons}
                            {#each current.buttons as btn}
                            <button
                                class="px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700"
                                on:click={() => { btn.action(); popupStack.close(); }}
                            >
                                {btn.label}
                            </button>
                            {/each}
                        {/if}

                        <button class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" on:click={popupStack.close}>
                            {#if current.closeText}
                                {current.closeText}
                            {:else}
                                Close
                            {/if}
                        </button>
                    </div>

                {:else if current.type == "component"}
                    <svelte:component this={current.component} {...current.props} />
                {/if}
            </div>
        </div>
    {/if}
{/if}