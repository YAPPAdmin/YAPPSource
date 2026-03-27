<script context="module" lang="ts">
    import type { BlockConfig } from "../../utils/blocks";

    export const blockConfig: BlockConfig = {
        name: "Hero Section",
        icon: "",
        description: "A large hero block with background image and title.",
        schema: {
            content: [
                {
                    key: "title",
                    label: "Headline",
                    type: "text",
                    default: "<h2>Bringing Art to everything</h2>", 
                    group: "Content"
                },
            ], 
            settings: [
                {
                    key: "imageUrl",
                    label: "Background Image",
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

    export let content: Record<string, any> = {};
    export let settings: Record<string, any> = {};

    function getDefaultContent(key: string) {
        return blockConfig.schema.content.find(item => item.key === key)?.default;
    }
    function getDefaultSetting(key: string) {
        return blockConfig.schema.settings.find(item => item.key === key)?.default;
    }

    // Only grab what we actually need now
    $: title = content.title ?? getDefaultContent("title");

    $: imageSetting = settings.imageUrl ?? getDefaultSetting("imageUrl");
    $: actualImageSrc = typeof imageSetting == "object" && imageSetting !== null && "src" in imageSetting 
        ? imageSetting.src 
        : imageSetting;
</script>

<div class="w-full relative overflow-hidden">
    
    <div class="w-full aspect-video md:aspect-21/9 bg-gray-900">
        <ImageCard src={actualImageSrc} alt="Hero Background" sizes="100vw" />
    </div>

    <div class="absolute inset-0 z-20 flex flex-col justify-end pb-5 ps-5 md:pb-10 md:ps-10 pointer-events-none">
        
        <div class="canvas-content w-[90%] md:w-2/3 md:max-w-lg pointer-events-auto text-white">
            {@html title}
        </div>

    </div>
</div>