<script lang="ts">
  import { clickOutside } from "$lib/utils/util";
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

                {:else if current.type == "image"}

                    <img 
                        src={current.imageUrl} 
                        alt={`${current.imageName || 'Image'}${current.imageAuthor ? ` by ${current.imageAuthor}` : ''}`}
                        class="rounded-lg"
                    />

                    {#if current.imageName || current.imageAuthor}
                        <div>
                            <!-- Heading -->
                            {#if current.imageName}
                                <h2>{current.imageName}</h2>
                            {:else}
                                <h2 class="italic">Unknown Image</h2>
                            {/if}

                            <!-- Author -->
                            {#if current.imageAuthor}
                                <h2>By {current.imageAuthor}</h2>    
                            {:else}
                                <h2 class="italic">Unknown Source</h2>
                            {/if}
                        </div>
                    {/if}    
                


                {:else if current.type == "component"}
                    <svelte:component this={current.component} {...current.props} />
                {/if}
            </div>
        </div>
    
    <!-- Modal -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {:else if current.variant == "modal"}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50" transition:fade on:click={(() => {popupStack.close()})}>
            <div class="bg-white rounded-2xl p-6 shadow-lg w-full max-w-[50vw] max-h-[75vh]" transition:fly={{ y: 20 }}>
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

                {:else if current.type == "image"}
                    <a href={current.imageUrl}>
                        <img 
                        src={current.imageUrl} 
                        alt={`${current.imageName || 'Image'}${current.imageAuthor ? ` by ${current.imageAuthor}` : ''}`}
                        class="rounded-lg hover:cursor-pointer"
                        />
                    </a>

                {:else if current.type == "component"}
                    <svelte:component this={current.component} {...current.props} />
                {/if}
            </div>
        </div>        
    {/if}
{/if}