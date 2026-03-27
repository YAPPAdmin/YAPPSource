<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";

    export let changeMessage: string = "";
    export let isSavingCommit: boolean = false;

    const dispatch = createEventDispatcher()

    const show = persistedStore("ui_pl_show_save_actions", true)
    const showSaveExpl = persistedStore("ui_pl_show_save_expl", false);
</script>

<div class="w-full max-w-sm">
    <button 
        on:click={() => ($show = !$show)} 
        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
    >
        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
        </span>
        <h2>Save</h2>
    </button>

    {#if $show}
        <!-- Explanation -->
        <div class="w-full" transition:slide={{ duration: 200 }}>
            <button class="font-semibold! text-secondary-500! text-sm! flex flex-row items-center justify-center" on:click={(() => $showSaveExpl = !$showSaveExpl)}>
                Your draft is already saved!
                <span
                    class="transform transition-transform duration-300"
                    class:rotate-90={$showSaveExpl}
                >
                    <Iconify iconId={"material-symbols-light:arrow-right-rounded"} />
                </span>
            </button>
            
            {#if $showSaveExpl}
                <p class="whitespace-normal text-gray-500! text-xs!" transition:slide={{ duration: 200 }}>
                    We continuously autosave your work in the background. You only need to <b>Save a Version</b> when you've reached a meaningful milestone or finished your edits. This keeps your blog's change history clean and easy to read.
                </p>
            {/if}    
        </div>

        <!-- Change Options -->
        <div class="w-full" transition:slide={{ duration: 200 }}>
            <!-- Change Message -->
            <div class="my-4">
                <label for="changeMessage" class="block text-sm font-medium text-gray-700 mb-1">Change Summary</label>
                <input id="changeMessage" type="text" bind:value={changeMessage} placeholder="Change Message" class="w-full" />
            </div>

            <div class="flex flex-col gap-2 items-center">
                
                <p class="w-full text-primary-500! font-semibold!">Save to ...</p>

                <div class="flex flex-row gap-x-2 w-full">
                    <button 
                        class="defaultButton w-1/2! m-0!" 
                        on:click={() => dispatch("save", false)} 
                        disabled={isSavingCommit}>
                        {isSavingCommit ? "Saving..." : "This Version"}
                    </button>
                    
                    <button 
                        class="defaultButton w-1/2! m-0!" 
                        on:click={() => dispatch("save", true)} 
                        disabled={isSavingCommit}>
                        {isSavingCommit ? "Saving..." : "New Version"}
                    </button>
                </div>

                <button 
                    class="defaultButton w-full! m-0! bg-error-default! hover:bg-error-light!" 
                    on:click={() => dispatch("cancel")} 
                    disabled={isSavingCommit}>
                    Revert Changes
                </button>
            </div>
        </div>
    {/if}
</div>