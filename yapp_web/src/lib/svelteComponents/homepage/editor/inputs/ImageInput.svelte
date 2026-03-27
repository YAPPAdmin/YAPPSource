<script lang="ts">
    import ImageCard from "$lib/svelteComponents/display/Images/ImageCard.svelte";
    import SmallGallery from "$lib/svelteComponents/display/Images/Selector/SmallGallery.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { fade, scale } from "svelte/transition";

    export let label: string | undefined = undefined;
    export let description: string | undefined = undefined;

    export let value: string | any = undefined;

    let showSelector = false;
    $: internalValue = typeof value === 'object' && value !== null ? value : { src: value, alt: '', title: '', link: '' };
    $: displayUrl = value;

    function handleSelect(event: CustomEvent) {
        const entry = event.detail;
        
        value = {
            ...internalValue,
            src: entry,
            alt: entry.description || entry.name || "",
            title: entry.name || "",
        };
        showSelector = false;
        console.log("URL: ", displayUrl)
    }

</script>

<div class="w-full flex flex-col gap-1.5">
    {#if label}
        <p class="block text-sm! font-semibold! text-gray-500!">{label}</p>
    {/if}

        <div class="relative w-full aspect-video border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all group">        
        
            {#if internalValue.src}
                <div class="w-full h-full">
                    <ImageCard                     
                        on:select={handleSelect} 
                        src={displayUrl.id}
                    />
                </div>
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button type="button" on:click={() => showSelector = true} class="bg-white text-primary-500 px-3 py-1.5 rounded-md text-sm font-medium shadow-md hover:bg-secondary-900 transition-transform hover:scale-105">
                    Replace Image
                </button>
            </div>

            {:else}
                <button type="button" on:click={() => showSelector = true} class="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-primary-600 transition-colors focus:outline-none">
                    <Iconify iconId="material-symbols-light:add-photo-alternate-outline-rounded" height={28} />
                    <span class="text-xs font-medium">Select Image</span>
                </button>
            {/if}
        </div>

    {#if description}
        <p class="text-xs text-gray-500 ml-1">{description}</p>
    {/if}

    <!-- Image Metadata -->
    {#if internalValue.src}
        <div class="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200" transition:fade={{duration: 200}}>
            
            <div class="flex flex-col gap-1">
                <p class="text-xs! text-gray-500 flex items-center gap-1">
                    <Iconify iconId="material-symbols-light:accessibility-new-rounded" height={14} />
                    Alt Text
                </p>
                <input 
                    type="text" 
                    bind:value={value.alt} 
                    placeholder="Describe image for screen readers" 
                    class="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
            </div>

            <div class="flex flex-col gap-1">
                <p class="text-xs! text-gray-500 flex items-center gap-1">
                    <Iconify iconId="material-symbols-light:title-rounded" height={14} />
                    Image Title
                </p>
                <input 
                    type="text" 
                    bind:value={value.title} 
                    placeholder="Tooltip text on hover" 
                    class="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
            </div>

            <div class="flex flex-col gap-1">
                <p class="text-xs! text-gray-500 flex items-center gap-1">
                    <Iconify iconId="material-symbols-light:link-rounded" height={14} />
                    Click Link (Optional)
                </p>
                <input 
                    type="url" 
                    bind:value={value.link} 
                    placeholder="https://" 
                    class="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
            </div>
            
        </div>
    {/if}

    <!-- Image Popup -->
    {#if showSelector} 
        <div 
            class="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 sm:p-8" 
            transition:fade={{ duration: 200 }}
        >
            <div 
                class="w-full max-w-5xl h-[85vh] flex flex-col gap-2" 
                transition:scale={{ duration: 200, start: 0.95 }}
            >
                <div class="flex justify-end">
                    <button type="button" on:click={() => showSelector = false} class="bg-white text-gray-800 rounded-full p-1.5 shadow-lg hover:bg-gray-200 hover:scale-110 transition-all">
                        <Iconify iconId="material-symbols-light:close-rounded" height={24} button={true}/>
                    </button>
                </div>
                
                <div class="w-full h-full bg-transparent overflow-hidden rounded-xl shadow-2xl">
                    <SmallGallery 
                        on:select={handleSelect} 
                        selectedId={typeof value === 'object' ? value?.id : value} 
                    />
                </div>
            </div>
        </div>
    {/if}

</div>  

