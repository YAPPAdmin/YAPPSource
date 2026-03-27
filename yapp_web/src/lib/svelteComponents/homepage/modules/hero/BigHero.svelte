<script context="module" lang="ts">
  import ImageCard from "$lib/svelteComponents/display/Images/ImageCard.svelte";
  import type { BlockConfig } from "../../utils/blocks";


    export const blockConfig: BlockConfig = {
        name: "Large Hero Section",
        icon: "material-symbols-light:groups-outline-rounded",
        description: "A large hero with text and clients",
        schema: {
            content: [
                {
                    key: "title",
                    label: "Headline",
                    type: "text",
                    default: "<h1>Start you journey with YAPP</h1>"
                },
                {
                    key: "subTitle",
                    label: "Sub-Headline",
                    type: "text",
                    default: "<p>Build your portfolio with the help of YetAnotherPortfolioPlatform! Build your portfolio with the help of YetAnotherPortfolioPlatform! Build your portfolio with the help of YetAnotherPortfolioPlatform! Build your portfolio with the help of YetAnotherPortfolioPlatform!</p>"
                },
                {
                    key: "clientTitle",
                    label: "Client-Headline",
                    type: "text",
                    default: "<p>Trusted by all of these, and more: </p>"
                },
                {
                    key: "clients",
                    label: "Clients",
                    type: "array",
                    default: [
                        {
                            client: "AlphaCorp",
                            link: "https://example.com",
                            logo: { src: "https://picsum.photos/seed/alpha/200", alt: "AlphaCorp" }
                        },
                        {
                            client: "Bravo Solutions",
                            link: "https://example.com",
                            logo: { src: "https://picsum.photos/seed/bravo/200", alt: "Bravo Solutions" }
                        },
                        {
                            client: "Charlie Industries",
                            link: "https://example.com",
                            logo: { src: "https://picsum.photos/seed/charlie/200", alt: "Charlie Industries" }
                        },
                        {
                            client: "Delta Tech",
                            link: "https://example.com",
                            logo: { src: "https://picsum.photos/seed/delta/200", alt: "Delta Tech" }
                        },
                    ],
                    itemSchema: {
                        type: "object",
                        schema: {
                            client: { type: "text", label: "Client Name" },
                            link: { type: "string", label: "URL/Link" },
                            logo: { type: "image", label: "Client Logo"},
                        }
                    }
                }
            ],
            settings: [],
        }
    }
</script>

<script lang="ts">
    export let content: Record<string, any> = {};
    export let settings: Record<string, any> = {};

    function getDefaultContent(key: string) { return blockConfig.schema.content.find(item => item.key === key)?.default; }
    function getDefaultSetting(key: string) { return blockConfig.schema.settings.find(item => item.key === key)?.default; }

    $: title = content.title ?? getDefaultContent("title");
    $: subTitle = content.subTitle ?? getDefaultContent("subTitle");
    $: clientTitle = content.clientTitle ?? getDefaultContent("clientTitle");
    $: clients = content.clients ?? getDefaultContent("clients");

    function getImageUrl(imgData: any) {
        if (!imgData) return "";
        return typeof imgData == "object" && "src" in imgData ? imgData.src : imgData;
    }
</script>

<div class="mx-auto w-full min-w-0 overflow-hidden">

    <!-- Hero -->
    <div class="flex flex-col justify-center overflow-hidden bg-background max-w-5xl mx-auto px-12 pt-24 lg:pt-32 min-h-[70vh]">

        <div class="h-[100vh-20em] max-w-4xl">
            <h1 class="text-foreground">
                {@html title}
            </h1>

            <p class="text-muted-foreground-1 mt-6 opacity-80">
                {@html subTitle}            
            </p>
        </div>

        <div class="mt-auto">
            <p class="text-muted-foreground-1 ">
                {@html clientTitle} 
            </p>
        </div>

    </div>

    <div class="relative bg-background w-full px-12">
        <div class="max-w-5xl mx-auto">
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-12">
                {#each clients as client}
                    <a 
                        href={client.link || "#"} 
                        class="group aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                    <div class="w-full h-2/3 rounded overflow-hidden flex justify-center items-center transition-all duration-300 group-hover:-translate-y-2">
                        <ImageCard 
                            src={getImageUrl(client.logo)} 
                            alt={client.client} 
                            width={300} 
                        />

                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div class="px-4 py-2 rounded-full bg-white/40 backdrop-blur-md shadow-xl">
                                <span class="text-xs! font-bold! text-white! tracking-wide text-foreground whitespace-nowrap">
                                    {client.client || 'Client'}
                                </span>
                            </div>
                        </div>

                    </div>
                    </a>
                {:else}
                    <div class="col-span-full py-12 text-center">
                        <p class="text-muted-foreground-1 text-sm">No clients added yet.</p>
                    </div>
                {/each}
            </div>   
        </div>
    </div>
</div>
