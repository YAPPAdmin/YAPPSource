<script lang="ts">
    import { Editor } from "@tiptap/core";
    import Underline from "@tiptap/extension-underline";
    import StarterKit from "@tiptap/starter-kit";
    import TextStyle from "@tiptap/extension-text-style";
    import Color from "@tiptap/extension-color";
    import { onDestroy, onMount } from "svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import Placeholder from "@tiptap/extension-placeholder"

    export let label: string | undefined = undefined;
    export let description: string | undefined = undefined;
    export let value: string | undefined = undefined;
    export let placeholder: string | undefined = description;

    let element: HTMLDivElement;
    let editor: Editor | undefined;

    const themeColors = [
        { label: "Primary", varName: "--color-primary-500" },
        { label: "Secondary", varName: "--color-secondary-500" },
        { label: "Tertiary", varName: "--color-tertiary-500" },
        { label: "Success", varName: "--color-success-default" },
        { label: "Warning", varName: "--color-warning-default" },
        { label: "Error", varName: "--color-error-default" },
    ];

    onMount(() => {
        editor = new Editor({
            element: element,
            extensions: [
                StarterKit.configure({
                    heading: { levels: [ 1, 2, 3 ]}
                }),
                Placeholder.configure({placeholder: placeholder}), 
                Underline, 
                TextStyle,
                Color,
            ],
            content: value || "",
            editorProps: {
                attributes: {
                    class: "p-3 min-h-[40px] max-h-[150px] overflow-y-auto text-sm bg-white focus:outline-none prose prose-sm max-w-none prose-p:m-0 prose-headings:m-0 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base"            
                }
            },
            onUpdate: ({ editor }) => {
                value = editor.getHTML();
            },
            onTransaction: () => {
                editor = editor; 
            }
        })
    })

    onDestroy(() => {
        if (editor) editor.destroy();
    });

    function handleFormatChange(event: Event) {
        if (!editor) return;
        const level = (event.currentTarget as HTMLSelectElement).value;
        
        if (level === "P") editor.chain().focus().setParagraph().run();
        if (level === "H1") editor.chain().focus().toggleHeading({ level: 1 }).run();
        if (level === "H2") editor.chain().focus().toggleHeading({ level: 2 }).run();
        if (level === "H3") editor.chain().focus().toggleHeading({ level: 3 }).run();
    }

    function handleColorChange(event: Event) {
        if (!editor) return;
        const color = (event.currentTarget as HTMLInputElement).value;
        editor.chain().focus().setColor(color).run();
    }

    $: activeBlock = editor?.isActive("heading", { level: 1 }) ? "H1" 
        : editor?.isActive("heading", { level: 2 }) ? "H2" 
        : editor?.isActive("heading", { level: 3 }) ? "H3" 
        : "P";

</script>

<div class="w-full flex flex-col gap-1.5">
    {#if label}
        <p class="block text-sm! font-semibold! text-gray-500!">{label}</p>
    {/if}
    
    <div class="border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
            
        {#if editor}
            <div class="flex flex-wrap items-center gap-1.5 p-1.5 border-b border-gray-200">
                
                <div class="flex items-center gap-0.5">
                    <button type="button" on:click={() => editor?.chain().focus().toggleBold().run()} 
                            class="p-1.5 rounded-md transition-colors {editor.isActive("bold") ? "bg-gray-200 text-gray-900 shadow-inner" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"}" 
                            title="Bold">
                        <Iconify iconId="material-symbols-light:format-bold-rounded" height={18} button={true}/>
                    </button>

                    <button type="button" on:click={() => editor?.chain().focus().toggleItalic().run()} 
                            class="p-1.5 rounded-md transition-colors {editor.isActive("italic") ? "bg-gray-200 text-gray-900 shadow-inner" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"}" 
                            title="Italic">
                        <Iconify iconId="material-symbols-light:format-italic-rounded" height={18} button={true} />
                    </button>

                    <button type="button" on:click={() => editor?.chain().focus().toggleUnderline().run()} 
                            class="p-1.5 rounded-md transition-colors {editor.isActive("underline") ? "bg-gray-200 text-gray-900 shadow-inner" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"}" 
                            title="Underline">
                        <Iconify iconId="material-symbols-light:format-underlined-rounded" height={18} button={true} />
                    </button>
                </div>

                <div class="w-px h-5 bg-gray-300 mx-0.5"></div>
                
                <div class="flex items-center gap-1.5">
                    {#each themeColors as themeColor}
                        <button 
                            type="button"
                            on:click={() => editor?.chain().focus().setColor(`var(${themeColor.varName})`).run()}
                            class="w-5 h-5 rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
                            style="background-color: var({themeColor.varName});"
                            title={themeColor.label}
                            aria-label="Set color to {themeColor.label}"
                        ></button>
                    {/each}

                    <div class="relative w-5 h-5 ml-1 flex items-center justify-center rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform overflow-hidden" title="Custom Hex Color">
                        <input 
                            type="color" 
                            on:input={handleColorChange} 
                            value={(editor?.getAttributes("textStyle").color || "").startsWith("#") ? editor?.getAttributes("textStyle").color : "#808080"}
                            class="absolute -inset-4 w-12 h-12 cursor-pointer opacity-0" 
                        />
                        <div class="w-full h-full pointer-events-none" style="background-color: {(editor?.getAttributes("textStyle").color || "").startsWith("#") ? editor?.getAttributes("textStyle").color : "#ffffff"};"></div>
                    </div>
                </div>

                <div class="w-px h-5 bg-gray-300 mx-0.5"></div>

                <select on:change={handleFormatChange} value={activeBlock} class="text-xs font-medium border-0 bg-transparent py-1.5 px-2 rounded hover:bg-gray-200 focus:ring-0 cursor-pointer text-gray-700 transition-colors">
                    <option value="P">Paragraph</option>
                    <option value="H1">Heading 1</option>
                    <option value="H2">Heading 2</option>
                    <option value="H3">Heading 3</option>
                </select>

            </div>
        {/if}

        <div bind:this={element}></div>
        
    </div>
    
    {#if description}
        <p class="text-xs text-gray-500 ml-1">{description}</p>
    {/if}
</div>