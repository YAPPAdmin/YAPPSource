<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { persistedStore } from "$lib/utils/persistedStore.ts/persistedStore";
    import { slide } from "svelte/transition";

    export let editorContent: any = undefined;

    type TocHeading = {
        level: number;
        text: string;
        index: number;
    }

    let headings: TocHeading[] = [];

    $: {
        headings = parseHeadings(editorContent)
    }

    function parseHeadings(content: any): TocHeading[] {
        if(!content) return []

        let extracted: TocHeading[] = []
        let globalIndex = 0;

        // HTML Strings
        if(typeof content == "string") {
            if(typeof window == "undefined") return []

            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "text/html")
            const headingElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
        
            headingElements.forEach((element, index) => {
                extracted.push({
                    level: parseInt(element.tagName.replace("H", "")),
                    text: element.textContent || "Empty Heading",
                    index: globalIndex++,
                });
            });
        };

        // JSON
        if(typeof content == "object") {

            function traverse(node: any) {
                if(node.type == "heading") {
                    const text = node.content?.map((content: any) => content.text).join("") || 'Empty Heading';
                    extracted.push({
                        level: node.attrs?.level || 1,
                        text: text,
                        index: globalIndex++,
                    })
                }

                if(node.content && Array.isArray(node.content)) {
                    node.content.forEach(traverse)
                }
            }
            traverse(content);
        }
        
        return extracted;
    
    }

    function getHeadingStyle(level: number) {
        if (level === 1) {
            return "text-sm font-bold text-primary-500 mt-2 border-transparent hover:text-primary-600";
        }
        if (level === 2) {
            return "text-sm font-medium text-secondary-500 border-secondary-200 mt-1 hover:text-secondary-600 hover:border-secondary-600";
        }
        return "text-xs font-normal text-tertiary-500 border-tertiary-200 hover:text-tertiary-600 hover:border-tertiary-600";
    }

    function scrollToHeading(index: number, event: Event) {
        event.preventDefault();

        const editorHeadings = document.querySelectorAll('.ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror h5, .ProseMirror h6');
        const targetElement = editorHeadings[index]

        if(targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest"});
        }
    }

    const show = persistedStore("ui_show_toc", true)

</script>

<div class="w-full max-w-sm">
    <button 
        on:click={() => ($show = !$show)} 
        class="flex flex-row items-center mb-2 justify-start w-full text-gray-700 hover:text-black font-semibold"
    >
        <span class="transform transition-transform duration-300 mr-1" class:-rotate-90={!$show}>
            <Iconify iconId="material-symbols-light:arrow-drop-down-rounded" />
        </span>
        <h2>Table of Contents</h2>
    </button>

    {#if $show}
        <div class="w-full" transition:slide={{ duration: 200 }}>
            {#if headings.length}
                <ul class="flex flex-col">
                    {#each headings as heading}
                        <li class="relative flex w-full">
                            <button 
                                on:click={(event) => scrollToHeading(heading.index, event)}
                                class="block w-full truncate py-1 pl-3 border-l-2  transition-colors {getHeadingStyle(heading.level)}"
                                style="margin-left: {(heading.level - 1) * 1.25}rem;"
                                title={heading.text}
                            >
                                {heading.text}
                            </button>
                            
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="text-gray-500! text-sm w-fit mx-auto">
                    No content to display.
                </p>
            {/if}
        </div>
    {/if}
</div>