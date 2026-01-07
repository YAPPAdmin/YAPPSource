<script lang="ts">
    import { Integration } from "$lib/classes";
    import PrivatTextInput from "$lib/helperComponents/PrivatTextInput.svelte";
    import 'iconify-icon'
    import { onMount } from "svelte";


    export let integration: Integration

    // logos
    import FacebookLogo from '$lib/assets/logo/facebook.webp';
    import InstagramLogo from '$lib/assets/logo/instagram.webp';

    const logoMap = {
        "facebook": FacebookLogo,
        "instagram": InstagramLogo,
    }

    const CardLogo = logoMap[integration.name.toLowerCase()]

    function parseGradient(): string {
        const colors = integration.gradient || [];
        
        if (!Array.isArray(colors)) {
            throw new Error('Integration.gradient must be an array of colors');
        }
        
        const colorStops = colors.map(color => {
            if (!isValidHexColor(color)) {
                throw new Error(`Invalid color: ${color}`);
            }
            return color;
        });

        return `linear-gradient(45deg, ${colorStops.join(',')})`;
    }

    function isValidHexColor(color: string): boolean {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

</script>


<!-- Card -->
<div class="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl">
    <div style:background-image={parseGradient()} class="integrationCardBackground h-52 flex flex-col justify-center items-center  rounded-t-xl">

        <img class="w-1/4" alt="{integration.name} Logo" src={CardLogo}/>

    </div>

    <div class="p-4 md:p-6">

        <!-- Active/Not Active -->
        {#if integration.active}
            <span class="block mb-1 text-xs font-semibold uppercase text-blue-600">Active</span>
        {:else}
            <span class="block mb-1 text-xs font-semibold uppercase text-red-600">Not Active</span>
        {/if}

        <!-- Name -->
        <h3 class="text-xl font-semibold text-gray-800">
            {integration.name}
        </h3>

        <!-- Description -->
        <p class="mt-3 text-gray-500">
            {integration.description}
        </p>
    </div>

    <div class="mt-auto flex border-t border-gray-200 divide-x divide-gray-200">
        <!-- Edit Button -->
        <a class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none" href="/">
            Edit
        </a>
        
        <!-- Activate Button -->
            {#if integration.active}
                <button class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-red-600 text-gray-800 shadow-sm hover:bg-red-500 focus:outline-none focus:bg-gray-50" href="/">
                    Deactivate
                </button> 
            {:else}
                <button class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-blue-600 text-gray-800 shadow-sm hover:bg-blue-500 focus:outline-none focus:bg-gray-50" href="/">
                    Activate
                </button> 
            {/if}

    </div>

</div>
<!-- End Card -->





