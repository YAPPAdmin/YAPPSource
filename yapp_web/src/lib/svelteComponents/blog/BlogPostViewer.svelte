<script lang=ts>
    import type { BlogPost } from "$lib/utils/blog/blog";
    import { createEventDispatcher } from "svelte";
    import { formatDate, formatTime } from "$lib/utils/util";
    import Iconify from "../iconify/Iconify.svelte";
    import Tooltip from "../base/Tooltip.svelte";
    import ImageCard from "../display/Images/ImageCard.svelte";

    export let blogPost: any;
    export let customClasses: string = "";

	$: rawText = blogPost?.currentVersion?.parsedHtml?.replace(/<[^>]*>?/gm, '') || "";
    $: wordCount = rawText.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
    $: readingTime = Math.max(1, Math.ceil(wordCount / 200));

    $: coverImageId = blogPost?.currentVersion?.versionData?.titleImageId || blogPost?.titleImageId;

    const dispatch = createEventDispatcher();

    function handleVersionChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        dispatch("switchVersion", { versionId: target.value });
    }

    function mountImageCards(node: HTMLElement) {
        const images = node.querySelectorAll("img");
        const componentInstances: any[] = [];

        images.forEach((img) => {
            const src = img.src;
            const alt = img.alt;

            const wrapper = document.createElement("div");
            wrapper.className = "w-full my-6 aspect-video rounded-xl overflow-hidden shadow-md";
            img.parentNode?.replaceChild(wrapper, img);

            const instance = new ImageCard({
                target: wrapper,
                props: {
                    src: src,
                    alt: alt,
                }
            });
            componentInstances.push(instance);
        });
        return {
            destroy() {
                componentInstances.forEach(instance => instance.$destroy())
            }
        }
    }

</script>

<!-- Version Switch -->
<div class="hidden">
    {#if blogPost.availableVersions && blogPost.availableVersions.length > 1}
        <div class="flex items-center gap-2">
            <label for="version-select" class="sr-only">Select Blog Version</label>
            <select 
                id="version-select"
                class="text-xs bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-primary-500 outline-hidden cursor-pointer hover:bg-gray-100 transition-colors"
                value={blogPost.currentVersion.id}
                on:change={handleVersionChange}
            >
                {#each blogPost.availableVersions as version}
                    <option value={version.id}>
                        Version {version.versionNumber} {version.isMainVersion ? '(Main)' : ''}
                    </option>
                {/each}
            </select>
        </div>
    {/if}
</div>

<div>
    {#if blogPost && blogPost.currentVersion}
        <article class="w-full mx-auto p-4 sm:py-12">
            <header class="flex flex-col">

                <!-- Header -->
                <h1 class="text-5xl! font-bold!">
                    {blogPost.currentVersion.versionData.title || blogPost.title}
                </h1>

                <!-- Information -->
                <div class="flex flex-row mt-6 justify-between text-sm">
                    
                    {#if blogPost.currentVersion.creationDate}
                        <div>
                            <p class="text-secondary-500!">
                                {formatDate(blogPost.currentVersion.creationDate)}, {formatTime(blogPost.currentVersion.creationDate)}
                            </p>
                        </div>
                    {/if}

                    <!-- Reading Time -->
                    {#if readingTime}
                        <Tooltip text={"Estimated Reading Time"}>
                            <div class="flex flex-row items-center justify-center space-x-2">
                                <Iconify iconId={"material-symbols-light:nest-clock-farsight-analog-outline-rounded"} />
                                <p class="text-secondary-500!">
                                    {readingTime}
                                </p>
                            </div>
                        </Tooltip>

                    {/if}
                </div>

                <!-- Description -->
                <div class="my-6">
                    {#if blogPost.currentVersion.versionData.description}
                        <p class="p-4 rounded-xl shadow-xl bg-background-800 text-xl font-semibold! text-secondary-500! leading-relaxed">
                            {blogPost.currentVersion.versionData.description}
                        </p>
                    {/if}
                </div>

                <!-- Title Image -->
                {#if blogPost.titleImageId || blogPost.currentVersion.versionData.titleImageId}
                    <figure class="mb-10 w-full aspect-21/9 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                        <ImageCard 
                            src={coverImageId} 
                            alt={`Cover image for ${blogPost.currentVersion.versionData.title || blogPost.title}`}
                            width={1200}
                            loading="eager"
                            fetchpriority="high"
                        />
                    </figure>
                {/if}
            </header>

            <main use:mountImageCards class="px-0 sm:px-6 lg:px-12 prose prose-lg sm:prose-xl prose-gray max-w-none prose-headings:font-bold prose-a:text-primary-600 hover:prose-a:text-primary-500 prose-img:rounded-xl prose-img:shadow-md {customClasses}">
                {@html blogPost.currentVersion.parsedHtml}
            </main>

        </article>
    {/if}
</div>