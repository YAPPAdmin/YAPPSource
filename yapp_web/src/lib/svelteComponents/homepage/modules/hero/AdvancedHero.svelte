<script context="module" lang="ts">
    import type { BlockConfig } from "../../utils/blocks";

    export const blockConfig: BlockConfig = {
        name: "Advanced Hero Section",
        icon: "material-symbols-light:groups-outline-rounded",
        description: "A two-column hero with text, buttons, reviews, and a side image.",
        schema: {
            content: [
                {
                    key: "title",
                    label: "Headline",
                    type: "text",
                    default: "<h1>Start you journey with YAPP</h1>"
                },
                {
                    key: "subtitle",
                    label: "Sub-Headline",
                    type: "text",
                    default: "<p>Build your portfolio with the help of YetAnotherPortfolioPlatform!</p>"
                },
                {
                    key: "buttons",
                    label: "Action Buttons",
                    type: "array",
                    default: [
                        { label: "Get Started", link: "/", style: "primary"},
                        { label: "Contact sales team", link: "/", style: "secondary"}
                    ],
                    itemSchema: {
                        type: "object",
                        schema: {
                            label: { type: "string", label: "Button Text"},
                            link: { type: "string", label: "URL/Link" },
                            style: { type: "select", label: "Button Style", options: ["primary", "secondary"]}
                        }
                    }
                },
                {
                    key: "reviews",
                    label: "Reviews",
                    type: "array", 
                    default: [
                        { likes: 10000, dislikes: 500, link: "/", logo: "https://picsum.photos/480/270", reviewer: "TrustedSource.example" },
                        { likes: 4800, dislikes: 200, link: "/", logo: "https://picsum.photos/480/270", reviewer: "TrustedSource.example" },
                    ],
                    itemSchema: {
                        type: "object",
                        schema: {
                            likes: { type: "number", label: "Positive Votes (Likes)" },
                            dislikes: { type: "number", label: "Negative Votes (Dislikes)" },
                            link: { type: "string", label: "URL/Link" },
                            logo: { type: "image", label: "Revier Logo"},
                            reviewer : { type: "text", label: "Reviewer"}
                        }
                    }
                }
            ],
            settings: [
                {
                    key: "image",
                    label: "Hero Image",
                    type: "image",
                    default: "https://picsum.photos/1080/1920",
                    group: "Design"
                }
            ]
        }
    }
</script>


<script lang="ts">
    import ImageCard from "$lib/svelteComponents/display/Images/ImageCard.svelte";
    import RatingDisplay from "$lib/svelteComponents/display/RatingDisplay.svelte";

    export let content: Record<string, any> = {};
    export let settings: Record<string, any> = {};

    function getDefaultContent(key: string) { return blockConfig.schema.content.find(item => item.key === key)?.default; }
    function getDefaultSetting(key: string) { return blockConfig.schema.settings.find(item => item.key === key)?.default; }

    $: title = content.title ?? getDefaultContent("title");
    $: subtitle = content.subtitle ?? getDefaultContent("subtitle");
    
    // Arrays
    $: buttons = content.buttons ?? getDefaultContent("buttons");
    $: reviews = content.reviews ?? getDefaultContent("reviews");

    // Handle Image Object
    $: imageSetting = settings.image ?? getDefaultSetting("image");
    $: imageUrl = typeof imageSetting === "object" && imageSetting !== null && "src" in imageSetting ? imageSetting.src : imageSetting;
    $: imageAlt = typeof imageSetting === "object" && imageSetting !== null && "alt" in imageSetting ? imageSetting.alt : "Hero Image";

    $: actualImageSrc = typeof imageSetting == "object" && imageSetting !== null && "src" in imageSetting 
        ? imageSetting.src 
        : imageSetting;
</script>


<div class="max-w-340 mx-auto px-4 sm:px-6 lg:px-8">

    <div class="grid md:grid-cols-2 gap-4 md:gap-8 xl:gap-20 md:items-center">
        <div>
            <!-- Title -->
            <div class="block text-3xl font-bold sm:text-4xl lg:text-6xl lg:leading-tight canvas-content [&>h2>strong]:text-primary-600 [&>h1>strong]:text-primary-600">
                {@html title}
            </div>

            <!-- Subtitle -->
            <div class="mt-3 text-lg">
                {@html subtitle}
            </div>

            <!-- Buttons -->
            <div class="mt-7 grid gap-3 w-full sm:inline-flex">
                {#if buttons && buttons.length > 0}
                    <div class="mt-7 flex flex-wrap gap-3 w-full">
                        {#each buttons as btn}
                            {#if btn.style === "primary"}
                                <a class="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg bg-primary-500 text-white shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all" href={btn.link}>
                                    {btn.label}
                                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                </a>
                            {:else}
                                <a class="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg bg-secondary-500 border border-gray-200 text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all" href={btn.link}>
                                    {btn.label}
                                </a>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Reviews -->
            {#if reviews && reviews.length > 0}

                <div class="mt-6 lg:mt-10 flex flex-wrap gap-y-6 gap-x-10 pt-6 lg:pt-8 w-full">                        
                    {#each reviews as review, i}
                        {@const totalVotes = (review.likes || 0) + (review.dislikes || 0)}
                        {@const ratingNum = totalVotes === 0 ? 0 : ((review.likes || 0) / totalVotes) * 5}
                        
                        <a href={review.link} class="w-fit flex flex-col items-center justify-center rounded shadow-xl hover:shadow-2xl transition-all p-2 hover:cursor-pointer">
                            <div class="flex gap-x-1 mx-auto">
                                <RatingDisplay likes={review.likes || 0} dislikes={review.dislikes || 0} />
                            </div>
                            
                            <p class="text-xs! sm:text-sm! ">
                                <span class="font-bold! text-primary-500">{ratingNum.toFixed(1)}</span> 
                                <span>/5</span>
                                <span>from {totalVotes} Reviews</span> 
                            </p>

                            {#if !review.logo}
                                <div class="w-16 mt-2">
                                    <ImageCard src={actualImageSrc} alt="Hero Background" sizes="100vw" />                               
                                </div>
                            {:else}
                                <div class="w-full mt-2">
                                    <p class="text-xs! text-gray-500!">From <span class="font-semibold text-secondary-500">{review.reviewer}</span></p>
                                </div>
                            {/if}
                        </a>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="relative ms-4">
            <div class="relative w-full aspect-4/5 sm:aspect-square md:aspect-4/5 lg:aspect-3/4 rounded-xl overflow-hidden shadow-2xl z-10">
                <ImageCard src={imageUrl} alt={imageAlt} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
        
            <div class="absolute inset-0 -z-1 bg-linear-to-tr from-surface-1 via-transparent to-travia-transparent size-full rounded-md mt-4 -mb-4 me-4 -ms-4 lg:mt-6 lg:-mb-6 lg:me-6 lg:-ms-6"></div>

        </div>
        <!-- End Col -->
    </div>

</div>
