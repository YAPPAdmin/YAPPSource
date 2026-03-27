<script lang="ts">
    import { fade } from 'svelte/transition';
    import { tick } from 'svelte';
    import type { FileWrapper } from "$lib/uploads/upload"; 
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";

    export let src: string | FileWrapper | undefined | null = undefined;
    export let alt: string = "";
    export let width: number | string = 500;
    export let customClasses: string = "";
    export let sizes: string = "100vw";

    let isLoading = true;
    let hasError = false;
    let finalSrc = "";
    let finalAlt = "";
    let dbImageId = "";

    let imgElement: HTMLImageElement; 

    $: {
        console.log("SRC: ", src)
        const result = resolveImage(src);
        finalSrc = result.url;
        finalAlt = alt || result.alt || "Gallery Image";
        dbImageId = result.id || "";
        
        // Trigger the loading check safely
        handleSourceChange(finalSrc);
    }

    async function handleSourceChange(url: string) {
        if (url) {
            isLoading = true;
            hasError = false;
            await tick(); 
            if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
                isLoading = false;
            }
        }
    }

    function resolveImage(input: string | FileWrapper | undefined | null): { url: string, alt?: string, id?: string } {
        if (!input) return { url: "" };

        
        if (typeof input === 'object') {
            if (input.blobURL) return { url: input.blobURL, alt: input.name };

            const id = typeof input.id === 'object' ? input.id?.id : input.id;

            if (id) {
                return { 
                    url: `/api/upload?getType=getImg&fileId=${id}${width ? `&width=${width}` : ''}`,
                    alt: input.name,
                    id: id
                };
            }
            if (input.online) return { url: input.online, alt: input.name };
            if (input.source) return { url: input.source, alt: input.name };
        }

        if (typeof input === 'string') {
            if (input.startsWith("http") || input.startsWith("blob:")) {
                return { url: input, alt: "External Image" };
            }
            if (input.length > 0) {
                return { 
                    url: `/api/upload?getType=getImg&fileId=${input}${width ? `&width=${width}` : ''}`,
                    alt: "Database Image",
                    id: input,
                };
            }
        }

        return { url: "" };
    }

</script>

<div class="relative w-full h-full min-h-0">
    {#if isLoading}
        <div 
            out:fade={{ duration: 300 }}
            class="absolute inset-0 flex animate-pulse bg-gray-200"
        >
            <span class="w-full h-full sr-only">Loading...</span>
        </div>
    {/if}

    {#if finalSrc && !hasError}
        <img
            bind:this={imgElement}
            src={finalSrc}
            srcset={dbImageId ? `
                /api/upload?getType=getImg&fileId=${dbImageId}&width=480 480w,
                /api/upload?getType=getImg&fileId=${dbImageId}&width=800 800w,
                /api/upload?getType=getImg&fileId=${dbImageId}&width=1200 1200w,
                /api/upload?getType=getImg&fileId=${dbImageId}&width=1920 1920w
            ` : undefined}
            sizes={sizes}
            alt={finalAlt}
            loading="lazy"
            decoding="async"
            style="filter: blur(0.2px);"
            class="block w-full h-full object-cover transition-all duration-500 hover:scale-102 {isLoading ? 'opacity-0' : 'opacity-100'} {customClasses}"
            on:load={() => isLoading = false}
            on:error={() => { isLoading = false; hasError = true; }}
            {...$$restProps}
        />

    {:else}
        <div class="flex flex-col items-center justify-center bg-gray-100 w-full h-full p-2 shadow-2xl rounded-xl">
            {#if hasError}
                <Iconify iconId="material-symbols-light:broken-image-outline-rounded" height={64} />
            {:else}
                <Iconify iconId="material-symbols-light:image-not-supported-outline-rounded" height={64} />
            {/if}
        </div>
    {/if}
</div>
