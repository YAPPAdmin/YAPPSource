<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";


    const show = persistedStore("ui_", true)
</script>

<div class="w-full max-w-sm">
        <button 
            on:click={() => ($show = !$show)} 
            class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
        >
            <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
                <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
            </span>
            <h3>Selected Version</h3>
        </button>

</div>