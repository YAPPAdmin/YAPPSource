<script lang="ts">
    import { createEventDispatcher } from "svelte";

    // Interface Inports Not working for some reason
    // import { ButtonGroupButton } from "$lib/interfaces"

    interface ButtonGroupButton {
        text: string;
        icon: string;
    }

    export let buttonTexts: ButtonGroupButton[] = [];
    let selectedButton: string | null = null;

	const dispatch = createEventDispatcher();

    function selectButton(data: ButtonGroupButton) {
        selectedButton = data.text;
        dispatch("buttonSelected", data)
    }


</script>


<div>

    {#each buttonTexts as {text, icon}, index}
        <button on:click={selectButton} type="button" class="py-3 px-4 inline-flex items-center gap-x-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 sm:p-5">
            {#if icon}
                <iconify-icon icon="material-symbols-light:home-outline-rounded" height={24}></iconify-icon>
            {/if}
            {text}
        </button>
    {/each}
</div>