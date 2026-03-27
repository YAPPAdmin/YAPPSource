<!-- https://tiptap.dev/docs/editor -->

<script lang="ts">
    import { fly } from "svelte/transition";
	import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import { clickOutside } from "$lib/utils/util";
    import Iconify from "../iconify/Iconify.svelte";
    import Tooltip from "../base/Tooltip.svelte";
	import { Editor } from "@tiptap/core";
    
    import Bold from "@tiptap/extension-bold";
    import Italic from "@tiptap/extension-italic";
    import Paragraph from "@tiptap/extension-paragraph";
    import Text from "@tiptap/extension-text";
    import Document from "@tiptap/extension-document";
    import Heading from "@tiptap/extension-heading";
    import Underline from "@tiptap/extension-underline"
    import Strike from "@tiptap/extension-strike"
    import Blockquote from "@tiptap/extension-blockquote";
    import Link from "@tiptap/extension-link"
    import ListItem from "@tiptap/extension-list-item"
    import OrderedList from "@tiptap/extension-ordered-list"
    import BulletList from "@tiptap/extension-bullet-list"
    import Highlight from "@tiptap/extension-highlight"
    import Subscript from "@tiptap/extension-subscript"
    import Superscript from "@tiptap/extension-superscript"
    import HorizontalRule from "@tiptap/extension-horizontal-rule"
    import InvisibleCharacters from "@tiptap/extension-invisible-characters"
    import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
    import CharacterCount from "@tiptap/extension-character-count"
    import Mathematics from "@tiptap/extension-mathematics"
    import History from "@tiptap/extension-history"
    import TextAlign from "@tiptap/extension-text-align"
    import Placeholder from "@tiptap/extension-placeholder"

    import { CustomImage } from "./TTImage";

    // Component Options
    export let editor: Editor | undefined = undefined;
    export let content: any;
    export let placeholder: string = "Write something ..."
    export let autofocus: boolean = false;
    export let charLimit: number | null = null;
    export let isEditable: boolean | undefined = undefined;

    // Dropdown States
    let ddAlignment = false;
    let ddHeadings = false;
    let ddFormat = false;
    let ddWeb = false;
    let ddImage = false;

    // Code Block Syntax Highlight
    import { all, createLowlight } from "lowlight"
    import ProgressBar from "../display/ProgressBar.svelte";
    import SmallGallery from "../display/Images/Selector/SmallGallery.svelte";

    // Change Event Dispatcher
    const dispatch = createEventDispatcher();

    // Syntax Highlighter
    const lowlight = createLowlight(all)

	let element: any;
    let doc: any = null;
    let lastSelectedNode: any = null;

	onMount(async() => {

        // TipTap Editor Config
		editor = new Editor({
            // Binds TipTap to the element
			element: element,
            
            // Extensions
            extensions: [
                // Standard Text
                Document, Paragraph, Text, Bold, Italic, InvisibleCharacters,
                Underline, Strike, Highlight, Subscript, Superscript,
                ListItem, Mathematics, HorizontalRule,

                Placeholder.configure({placeholder: placeholder}),  
                CodeBlockLowlight.configure({ lowlight }),          
                Heading.configure({ levels: [1, 2, 3] }),           
                CharacterCount.configure({ limit: charLimit }),     
                History.configure({ depth: 50 }),                   
                Link.configure({ HTMLAttributes: { class: "text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:text-blue-800" } }),
                BulletList.configure({ HTMLAttributes: { class: "list-disc ml-6" } }),
                OrderedList.configure({ HTMLAttributes: { class: "list-decimal ml-6" } }),
                Blockquote.configure({HTMLAttributes: { class: "border-l-4 border-gray-300 pl-4 italic text-gray-600" } }),
                TextAlign.configure({
                    types: ["heading", "paragraph"],
                    alignments: ["left", "right", "center", "justify"],
                    defaultAlignment: "left",
                }),
            
                CustomImage,
            ],

			content: content,       // Placeholder Text
            autofocus: autofocus,   // place the cursor in the editor after initialization
            editable: isEditable,   // Makes the text editable
            // injectCSS: false,       // prevent loading the default CSS 
            
            onUpdate: ({ editor }) => {
                // Create change event for parent
                dispatch("change", { content: editor.getJSON()})
            },

            onTransaction: () => {
				editor = editor;
                doc = editor.state.doc;
			},

            onSelectionUpdate: ({ editor }) => {
                const { from, to } = editor.state.selection;

                editor.state.doc.nodesBetween(from, to, (node) => {
                    if (node.isBlock) {
                        lastSelectedNode = node;
                        doc = editor.state.doc;
                    }
                });
                // Force re-render to update reactivity
                lastSelectedNode = lastSelectedNode;
                doc = doc;
            },
		});
        doc = editor.state.doc

	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

    // Watch for changes in editability
	$: if (editor) {
		editor.setEditable(isEditable);
	}

    function handleImageSelected(event: CustomEvent<any>) {
        const image = event.detail;

        const displayWidth = 800;
        const srcURL = `/api/upload?getType=getImg&fileId=${image.id}&width=${displayWidth}`;

        let displayHeight = null;
        if(image.metadata?.width && image.metadata?.height) {
            const ratio = image.metadata.height / image.metadata.width;
            displayHeight = Math.round(displayWidth * ratio)
        }

        editor.chain().focus().setImage({
            src: srcURL,
            alt: image.name || image.description || "Blog Image",
            title: image.description || "",
            fileId: image.id,
            width: displayWidth,
            height: displayHeight
        }).run();

        ddImage = false;
    }

    const btnClass = "flex p-2 justify-center items-center gap-x-0.5 text-sm font-semibold rounded-full text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
</script>

<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
</svelte:head>


<div class="w-full flex space-x-3 items-start overflow-visible" class:cursor-not-allowed={!isEditable}>
    <!-- https://preline.co/docs/text-editor.html -->
    <div 
        class="w-full flex-1 flex flex-col shadow-2xs bg-white border border-gray-200 rounded-xl overflow-visible"
    >

        <!-- Toolbar -->
        {#if editor}
            <div class="h-16 rounded-t-xl sticky top-0 z-50 bg-white flex flex-row divide-x divide-gray-300 items-center border-b border-gray-200 p-2">

                <!-- Editor Settings -->
                <div class="flex flex-row items-center justify-center px-2.5">
                <!-- Show Invisibl -->
                    <Tooltip text="Toggle Invisible Characters">
                        <button
                            class="{btnClass} {editor.storage.invisibleCharacters.visibility() ? "bg-tertiary-500 hover:bg-tertiary-600" : ""}"
                            on:click={() => editor.chain().focus().toggleInvisibleCharacters().run()}
                            disabled={!isEditable}
                        >
                            <Iconify iconId={"material-symbols-light:format-paragraph-rounded"} />
                        </button>
                    </Tooltip>

                    <!-- Plain -->
                    <Tooltip text="Plain Text">
                        <button class={btnClass} on:click={() => editor.chain().focus().setParagraph().run()} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:format-clear-rounded"} />
                        </button>
                    </Tooltip>
                </div> 

                <!-- Basic Format -->
                <div class="flex flex-row items-center justify-center px-2.5">
                    <!-- Headings -->
                    <div>
                        <!-- Headings Button -->
                        <button class={btnClass} class:bg-tertiary-500={editor.isActive("heading")} on:click={(() => ddHeadings = !ddHeadings)} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:format-h1-rounded"} />
                            <Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} height={20} />
                        </button>

                        <!-- Headings Box -->
                        {#if ddHeadings}
                            <div use:clickOutside on:click_outside={(() => ddHeadings = false )} in:fly={{}} out:fly={{}} class="p-1 rounded bg-white absolute shadow z-10">
                                <!-- H1 -->
                                <Tooltip text="Heading">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("heading", { level: 1 })} on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!isEditable}>
                                        <Iconify iconId={"material-symbols-light:format-h1-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- H2 -->
                                <Tooltip text="Heading 2">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("heading", { level: 2 })} on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!isEditable}>
                                        <Iconify iconId={"material-symbols-light:format-h2-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- H3 -->
                                <Tooltip text="Heading 3">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("heading", { level: 3 })} on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={!isEditable}>
                                        <Iconify iconId={"material-symbols-light:format-h3-rounded"} />
                                    </button>
                                </Tooltip>
                            </div>
                        {/if}
                    </div>
                    
                    <!-- Text Format -->
                    <div class="relative">                        
                        <!-- Text Format Button -->
                        <button class={btnClass} on:click={(() => (ddFormat = !ddFormat))} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:brush-outline"} />
                            <Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} height={20} />
                        </button>

                        <!-- Text Format Box -->
                        {#if ddFormat}
                            <div use:clickOutside on:click_outside={(() => ddFormat = false )} in:fly={{}} out:fly={{}} class="p-1 rounded bg-white absolute shadow z-10">
                                
                                <!-- Bold -->
                                <Tooltip text="Bold">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("bold")} on:click={() => editor.chain().focus().toggleBold().run()}>
                                        <Iconify iconId={"material-symbols-light:format-bold-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- Italic -->
                                <Tooltip text="Italic">
                                <button class={btnClass} class:bg-tertiary-500={editor.isActive("italic")} on:click={() => editor.chain().focus().toggleItalic().run()}>
                                    <Iconify iconId={"material-symbols-light:format-italic-rounded"} />
                                </button>
                                </Tooltip>

                                <!-- Underline -->
                                <Tooltip text="Underline">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("underline")} on:click={() => editor.chain().focus().toggleUnderline().run()}>
                                        <Iconify iconId={"material-symbols-light:format-underlined-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- Strike -->
                                <Tooltip text="Strike">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("strike")} on:click={() => editor.chain().focus().toggleStrike().run()}>
                                        <Iconify iconId={"material-symbols-light:strikethrough-s-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- Blockquore/Indent -->
                                <Tooltip text="Indent/Blockquote">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("blockquote")} on:click={() => editor.chain().focus().toggleBlockquote().run()}>
                                        <Iconify iconId={"material-symbols-light:format-indent-increase-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- HR -->
                                <Tooltip text="Horizontal Rule">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("horizontalrule")} on:click={() => editor.chain().focus().setHorizontalRule().run()}>
                                        <Iconify iconId={"material-symbols-light:horizontal-rule-rounded"} />
                                    </button>
                                </Tooltip>
                            </div>
                        {/if}
                    </div>

                    <!-- ALignment -->
                    <div>
                            <!-- Alignment Button -->
                            <button class={btnClass} class:bg-tertiary-500={!editor.isActive({ textAlign: "left"})} on:click={(() => ddAlignment = !ddAlignment)} disabled={!isEditable}>
                                <Iconify iconId={"material-symbols-light:format-align-left-rounded"} />
                                <Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} height={20} />
                            </button>

                            <!-- Alignment BOX -->
                            {#if ddAlignment}
                                <div use:clickOutside on:click_outside={(() => ddAlignment = false )} in:fly={{}} out:fly={{}} class="p-1 rounded bg-white absolute shadow z-10">
                                    
                                    <!-- Align Left -->
                                    <Tooltip text="Align Left">
                                        <button class={btnClass} class:bg-tertiary-500={editor.isActive({ textAlign: "left" })} on:click={() => editor.chain().focus().toggleTextAlign("left").run()} disabled={!isEditable}>
                                            <Iconify iconId={"material-symbols-light:format-align-left-rounded"} />
                                        </button>
                                    </Tooltip>

                                    <!-- Align Center -->
                                    <Tooltip text="Align Center">
                                        <button class={btnClass} class:bg-tertiary-500={editor.isActive({ textAlign: "center" })} on:click={() => editor.chain().focus().toggleTextAlign("center").run()} disabled={!isEditable}>
                                            <Iconify iconId={"material-symbols-light:format-align-justify-rounded"} />
                                        </button>
                                    </Tooltip>

                                    <!-- Align Right -->
                                    <Tooltip text="Align Right">
                                        <button class={btnClass} class:bg-tertiary-500={editor.isActive({ textAlign: "right" })} on:click={() => editor.chain().focus().toggleTextAlign("right").run()} disabled={!isEditable}>
                                            <Iconify iconId={"material-symbols-light:format-align-right-rounded"} />
                                        </button>
                                    </Tooltip>

                                    <!-- Align Justify -->
                                    <Tooltip text="Align Justify">
                                        <button class={btnClass} class:bg-tertiary-500={editor.isActive({ textAlign: 'justify' })} on:click={() => editor.chain().focus().toggleTextAlign("justify").run()} disabled={!isEditable}>
                                            <Iconify iconId={"material-symbols-light:format-align-center-rounded"} />
                                        </button>
                                    </Tooltip>
                                </div>
                            {/if}
                    </div>

                    <!-- Highlight -->
                    <Tooltip text="Highlight">
                        <button class={btnClass} class:bg-tertiary-500={editor.isActive("highlight")} on:click={() => editor.chain().focus().toggleHighlight().run()} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:format-ink-highlighter-outline-rounded"} />
                        </button>
                    </Tooltip>
                </div>

                <!-- Lists -->
                <div class="flex flex-row items-center justify-center px-2.5">
                    <!-- Orderd List -->
                    <Tooltip text="Orderd List">
                        <button class={btnClass} class:bg-tertiary-500={editor.isActive("orderedList")} on:click={() => editor.chain().focus().toggleOrderedList().run()} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:format-list-numbered-rounded"} />
                        </button>
                    </Tooltip>

                    <!-- Unorder List -->
                    <Tooltip text="Unorderd List">
                        <button class={btnClass} class:bg-tertiary-500={editor.isActive("bulletList")} on:click={() => editor.chain().focus().toggleBulletList().run()} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:format-list-bulleted-rounded"} />
                        </button>
                    </Tooltip>
                </div>

                <!-- Script -->
                <div class="flex flex-row items-center justify-center px-2.5">
                    <!-- Subscript -->
                    <Tooltip text="Subscript">
                        <button class={btnClass} class:bg-tertiary-500={editor.isActive("subscript")} on:click={() => editor.chain().focus().toggleSubscript().run()} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:subscript-rounded"} />
                        </button>
                    </Tooltip>

                    <!-- Superscript -->
                    <Tooltip text="Superscript">
                        <button class={btnClass} class:bg-tertiary-500={editor.isActive("superscript")} on:click={() => editor.chain().focus().toggleSuperscript().run()} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:superscript-rounded"} />
                        </button>
                    </Tooltip>
                </div>

                <!-- Image-->
                <div class="flex flex-row relative items-center justify-center px-2.5">
                    <Tooltip text="Images">
                        <button class={btnClass} on:click={(() => ddImage = !ddImage)} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:image-outline-rounded"} />
                        </button>
                    </Tooltip>

                        {#if ddImage}
                            <div use:clickOutside on:click_outside={(() => ddImage = false )} in:fly={{}} out:fly={{}} 
                                class="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 w-[320px] max-w-[calc(100vw-2rem)] max-h-90 overflow-y-auto shadow-2xl rounded-xl z-0"
                            >
                                <SmallGallery on:select={handleImageSelected}/>
                            </div>
                        {/if}
                    </div>

                <!-- Web -->
                <div class="flex flex-row items-center justify-center px-2.5">
                    <div>
                        <!-- Web Button -->
                        <button class={btnClass} on:click={(() => ddWeb = !ddWeb)} disabled={!isEditable}>
                            <Iconify iconId={"pepicons-pencil:internet"} />
                            <Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} height={20} />
                        </button>

                        {#if ddWeb}
                            <div use:clickOutside on:click_outside={(() => ddWeb = false )} in:fly={{}} out:fly={{}} class="p-1 rounded bg-white absolute shadow z-10">
                                
                                <!-- Link -->
                                <Tooltip text="Link">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("link")} on:click={() => editor.chain().focus().toggleLink({ href: "https://example.com" }).run()} disabled={!isEditable}>
                                        <Iconify iconId={"material-symbols-light:link-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- Code -->
                                <Tooltip text="Syntaxted Code">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("codeBlock")} on:click={() => editor.chain().focus().toggleCodeBlock().run()} disabled={!isEditable}>
                                        <Iconify iconId={"material-symbols-light:code-blocks-outline-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- Youtube -->
                                <Tooltip text="YouTube Video">
                                    <button class={btnClass} class:bg-tertiary-500={editor.isActive("youtube")}
                                        on:click={() => editor.chain().focus().setYoutubeVideo({
                                            src: "https://www.youtube.com/watch?v=Q0lx8Bk9FDs&list=RDQ0lx8Bk9FDs&start_radio=1",
                                            width: 640,
                                            height: 480,
                                            })
                                        .run()}
                                        disabled={!isEditable}
                                        >
                                        <Iconify iconId={"material-symbols-light:youtube-activity-rounded"} />
                                    </button>
                                </Tooltip>
                            </div>
                        {/if}

                    </div>
                </div>

                <!-- History -->
                <div class="flex flex-row items-center justify-center px-2.5">
                    <!-- Undo -->
                    <Tooltip text="Undo">
                        <button class="{btnClass} {!editor.can().undo() ? "opacity-30 cursor-not-allowed" : ""}" on:click={() => editor.chain().focus().undo().run()} disabled={!isEditable}>
                            <Iconify style={"color: text-primary-500"} iconId={"material-symbols-light:undo-rounded"} />
                        </button>
                    </Tooltip>

                    <!-- Redo -->
                    <Tooltip text="Redo">
                        <button class="{btnClass} {!editor.can().redo() ? "opacity-30 cursor-not-allowed" : ""}" on:click={() => editor.chain().focus().redo().run()} disabled={!isEditable}>
                            <Iconify iconId={"material-symbols-light:redo-rounded"} />
                        </button>
                    </Tooltip>
                </div>

                <!-- Char Limit / Locked -->
                <div class="ml-auto pr-4 flex items-center space-x-4">
                    {#if charLimit}
                        <Tooltip text={"Word Limit"}>
                            <div class="border border-gray-200 rounded-2xl p-2">
                                <ProgressBar value={(editor.storage.characterCount.characters() / charLimit) * 100}/>
                                <p>{editor.storage.characterCount.characters()}/{charLimit}</p>
                            </div>
                        </Tooltip>
                    {/if}    

                    {#if isEditable != undefined}
                        {#if isEditable}
                            <Tooltip text={"Editing unlocked"}>
                                <Iconify iconId={"material-symbols-light:lock-open-outline-rounded"} />
                            </Tooltip>
                        {:else}
                            <Tooltip text={"Editing locked"}>
                                <Iconify iconId={"material-symbols-light:lock-outline"} />
                            </Tooltip>
                        {/if}
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Editor -->
        <!--class="p-4 min-h-72 h-full outline-none focus:outline-none border-none list-inside" -->
        <div 
            
            class=
            "
                editor-content grow p-4 focus:outline-none wrap-break-word
            
                [&_img.ProseMirror-selectednode]:outline-3 
                [&_img.ProseMirror-selectednode]:outline-blue-500 
                [&_img.ProseMirror-selectednode]:outline-offset-2

                [&_span[style*='width']]:max-w-full!
                [&_span[style*='width']]:inline-block
            "
            bind:this={element} 
        />
    </div>
</div>
