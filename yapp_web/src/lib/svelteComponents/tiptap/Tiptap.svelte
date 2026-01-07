<!-- https://tiptap.dev/docs/editor -->

<script lang="ts">
    import { fly } from 'svelte/transition';
	import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import { clickOutside } from '$lib/utils/util';

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
    import Youtube from "@tiptap/extension-youtube"
    import CharacterCount from "@tiptap/extension-character-count"
    import Mathematics from "@tiptap/extension-mathematics"
    import History from "@tiptap/extension-history"
    import TextAlign from "@tiptap/extension-text-align"
    import FileHandler from "@tiptap/extension-file-handler"
    import Image from '@tiptap/extension-image';
    import Placeholder from '@tiptap/extension-placeholder'

    // Dropdown States
    let ddAlignment = false;
    let ddHeadings = false;
    let ddFormat = false;
    let ddWeb = false;


    // Code Block Syntax Highlight
    import { all, createLowlight } from "lowlight"
    import ProgressBar from "../display/ProgressBar.svelte";

    // Change Event Dispatcher
    const dispatch = createEventDispatcher();

    // Syntax Highlighter
    const lowlight = createLowlight(all)

    // Component Options
    export let content: any = "<p>Hello World!</p>";
    export let placeholder: string = "Write something ..."
    export let autofocus: boolean = false;
    export let charLimit: number | null = null;
    export let isEditable: boolean | undefined = undefined;

	let element: any;
	let editor: any;

    let updatingFromEditor = false;
    let updatingFromParent = false;

    let doc: any = null;
    let lastSelectedNode: any = null;


    let lastContentUpdate: number = 0;
    const debounceTime: number = 1000; // Adjust the debounce time as needed

	onMount(async() => {

        // TipTap Editor Config
		editor = new Editor({

            // Binds TipTap to the element
			element: element,
            
            // Extensions
            extensions: [
                Document,
                Paragraph,
                Text,
                Bold,
                Italic,
                InvisibleCharacters,                
                Underline,
                Strike,                
                HorizontalRule,
                ListItem,
                Subscript,
                Superscript,
                Highlight,
                Mathematics,

                Placeholder.configure({
                    placeholder: placeholder
                }),

                Image.configure({
                    inline: true,
                }),

                TextAlign.configure({
                    types: ['heading', 'paragraph'],
                    alignments: ['left', 'right', "center", "justify"],
                    defaultAlignment: 'left',
                }),


                BulletList.configure({
                    HTMLAttributes: {
                        class: "list-disc ml-6",
                    },
                }),

                OrderedList.configure({
                    HTMLAttributes: {
                        class: "list-decimal ml-6",
                    },
                }),

                Blockquote.configure({
                    HTMLAttributes: {
                        class: "border-l-4 border-gray-300 pl-4 italic text-gray-600",
                    },
                }),

                FileHandler.configure({
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],

                    onDrop: (currentEditor, files, pos) => {
                        files.forEach(file => {
                            const fileReader = new FileReader();
                            fileReader.readAsDataURL(file);
                            fileReader.onload = () => {
                                currentEditor.chain().insertContentAt(pos, {
                                type: 'image',
                                attrs: {
                                    src: fileReader.result,
                                },
                                }).focus().run();
                            };
                        });
                    },

                    onPaste: (currentEditor, files) => {
                        files.forEach(file => {
                            const fileReader = new FileReader();
                            fileReader.readAsDataURL(file);
                            fileReader.onload = () => {
                                currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                                type: 'image',
                                attrs: {
                                    src: fileReader.result,
                                },
                                }).focus().run();
                            };
                        });
                    },
                }),

                Youtube.configure({
                    nocookie: true,
                    modestBranding: true,
                      progressBarColor: "white",
                }),

                Link.configure({
                    HTMLAttributes: {
                        class: "text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:text-blue-800"
                    }
                }),

                CodeBlockLowlight.configure({
                    lowlight,
                }),

                Heading.configure({
                levels: [1, 2, 3],
                }),

                CharacterCount.configure({
                    limit: charLimit,
                }),

                History.configure({
                    depth: 50,
                }),

            ],

            // Placeholder Text
			content: content,
			
            // place the cursor in the editor after initialization
            autofocus: autofocus,

            // Makes the text editable
            editable: isEditable,

            // prevent loading the default CSS (which isn"t much anyway)
            injectCSS: false,
            
            onUpdate: ({ editor }) => {
                updatingFromEditor = true;

                // Create change event for parent
                dispatch("change", { content: editor.getJSON()})

                updatingFromEditor = false;
            },

            onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
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

    // Watch for changes in parent-provided `content`
    $: if (editor && !updatingFromEditor) {
        const current = editor.getJSON();
        if (JSON.stringify(current) !== JSON.stringify(content)) {
            updatingFromParent = true;
            editor.commands.setContent(content, false); // false = don't emit another update
            updatingFromParent = false;
        }
    }

</script>

<!-- Grid -->
<div class="w-full flex  space-x-3 items-start overflow-visible">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
    <!-- https://preline.co/docs/text-editor.html -->
    <div 
        class="flex-1 flex flex-col shadow-2xs bg-white border border-gray-200 rounded-xl overflow-visible"
        class:cursor-pointer={isEditable}
        class:cursor-not-allowed={!isEditable}
    >

        <!-- Toolbar -->
        {#if editor}
            <div 
                class="h-16 mt-2 sticky top-0 bg-white flex items-center gap-x-0.5 border-b border-gray-200 p-2"
            >

                <!-- Show Invisibl -->
                <Tooltip text="Toggle Invisible Characters">
                <button
                    class:bg-tertiary-500={editor.storage.invisibleCharacters.visibility()}
                    class:hover:bg-tertiary-600={editor.storage.invisibleCharacters.visibility()}
                    class:hover:bg-gray-100={!editor.storage.invisibleCharacters.visibility()}

                    class:cursor-pointer={isEditable}
                    class:cursor-not-allowed={!isEditable}
                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full text-gray-800"

                    on:click={() => editor.chain().focus().toggleInvisibleCharacters().run()}
                    disabled={!isEditable}
                    >
                        <Iconify iconId={"material-symbols-light:format-paragraph-rounded"} />
                    </button>
                </Tooltip>

                <!-- Plain -->
                <Tooltip text="Plain Text">
                    <button 
                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}
                        
                        on:click={() => editor.chain().focus().setParagraph().run()}
                        disabled={!isEditable}
                    >
                        <Iconify iconId={"material-symbols-light:format-clear-rounded"} />
                    </button>
                </Tooltip>

                <!-- Vertical Divider -->
                <div class="h-6 border-l border-gray-300 mx-1"></div>

                <!-- Headings -->
                <div>

                    <!-- Headings Button -->
                    <button
                        class="flex flex-row text-sm font-semibold rounded-full text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={(() => ddHeadings = !ddHeadings)}
                        disabled={!isEditable}
                    >
                        <Iconify iconId={"material-symbols-light:format-h1-rounded"} />
                        <Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} height={20} />
                    </button>

                    <!-- Headings Box -->
                    {#if ddHeadings}
                        <div use:clickOutside on:click_outside={(() => ddHeadings = false )} in:fly={{}} out:fly={{}} class="p-1 rounded bg-white absolute shadow z-10">

                            <!-- H1 -->
                            <Tooltip text="Heading">
                                <button
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100"

                                    class:cursor-pointer={isEditable}
                                    class:cursor-not-allowed={!isEditable}

                                    on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                    disabled={!isEditable}
                                >
                                    <Iconify iconId={"material-symbols-light:format-h1-rounded"} />
                                </button>
                            </Tooltip>

                            <!-- H2 -->
                            <Tooltip text="Heading 2">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                                    class:cursor-pointer={isEditable}
                                    class:cursor-not-allowed={!isEditable}

                                    on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                    disabled={!isEditable}
                                >
                                    <Iconify iconId={"material-symbols-light:format-h2-rounded"} />
                                </button>
                            </Tooltip>

                            <!-- H3 -->
                            <Tooltip text="Heading 3">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                                    class:cursor-pointer={isEditable}
                                    class:cursor-not-allowed={!isEditable}

                                    on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                    disabled={!isEditable}
                                >
                                    <Iconify iconId={"material-symbols-light:format-h3-rounded"} />
                                </button>
                            </Tooltip>
                        
                        </div>
                     {/if}

                </div>
                

                <!-- Vertical Divider -->
                <div class="h-6 border-l border-gray-300 mx-1"></div>

                <!-- Text Format -->
                <div>                        
                    
                    <!-- Text Format Button -->
                    <button 
                        class="flex flex-row text-sm font-semibold rounded-full text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={(() => (ddFormat = !ddFormat))}
                        disabled={!isEditable}
                        >
                        <Iconify iconId={"material-symbols-light:brush-outline"} />
                        <Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} height={20} />
                    </button>


                    <!-- Text Format Box -->
                    {#if ddFormat}
                        <div use:clickOutside on:click_outside={(() => ddFormat = false )} in:fly={{}} out:fly={{}} class="p-1 rounded bg-white absolute shadow z-10">
                            
                            <!-- Bold -->
                            <Tooltip text="Bold">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "
                                    on:click={() => editor.chain().focus().toggleBold().run()}
                                >
                                    <Iconify iconId={"material-symbols-light:format-bold-rounded"} />
                                </button>
                            </Tooltip>

                            <!-- Italic -->
                            <Tooltip text="Italic">
                            <button 
                                class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "
                                on:click={() => editor.chain().focus().toggleItalic().run()}
                                >
                                <Iconify iconId={"material-symbols-light:format-italic-rounded"} />
                            </button>
                            </Tooltip>

                            <!-- Underline -->
                            <Tooltip text="Underline">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "
                                    on:click={() => editor.chain().focus().toggleUnderline().run()}
                                    >
                                    <Iconify iconId={"material-symbols-light:format-underlined-rounded"} />
                                </button>
                            </Tooltip>

                            <!-- Strike -->
                            <Tooltip text="Strike">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "
                                    on:click={() => editor.chain().focus().toggleStrike().run()}
                                    >
                                    <Iconify iconId={"material-symbols-light:strikethrough-s-rounded"} />
                                </button>
                            </Tooltip>

                            <!-- Blockquore/Indent -->
                            <Tooltip text="Indent/Blockquote">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "
                                    on:click={() => editor.chain().focus().toggleBlockquote().run()}
                                    >
                                    <Iconify iconId={"material-symbols-light:format-indent-increase-rounded"} />
                                </button>
                            </Tooltip>

                            <!-- HR -->
                            <Tooltip text="Horizontal Rule">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "
                                    on:click={() => editor.chain().focus().setHorizontalRule().run()}
                                    >
                                    <Iconify iconId={"material-symbols-light:horizontal-rule-rounded"} />
                                </button>
                            </Tooltip>
                        </div>
                    {/if}
                </div>

                <!-- Vertical Divider -->
                <div class="h-6 border-l border-gray-300 mx-1"></div>

                <!-- ALignment -->
                <div>

                        <!-- Alignment Button -->
                        <button 
                            class="flex flex-row text-sm font-semibold rounded-full text-gray-800 hover:bg-gray-100 "

                            class:cursor-pointer={isEditable}
                            class:cursor-not-allowed={!isEditable}

                            on:click={(() => ddAlignment = !ddAlignment)}
                            disabled={!isEditable}
                            >
                            <Iconify iconId={"material-symbols-light:format-align-left-rounded"} />
                            <Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} height={20} />
                        </button>

                        <!-- Alignment BOX -->
                        {#if ddAlignment}
                            <div use:clickOutside on:click_outside={(() => ddAlignment = false )} in:fly={{}} out:fly={{}} class="p-1 rounded bg-white absolute shadow z-10">
                                
                                <!-- Align Left -->
                                <Tooltip text="Align Left">
                                    <button 
                                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                                        class:cursor-pointer={isEditable}
                                        class:cursor-not-allowed={!isEditable}

                                        on:click={() => editor.chain().focus().toggleTextAlign('left').run()}
                                        disabled={!isEditable}
                                        >
                                        <Iconify iconId={"material-symbols-light:format-align-left-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- Align Center -->
                                <Tooltip text="Align Center">
                                    <button 
                                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                                        class:cursor-pointer={isEditable}
                                        class:cursor-not-allowed={!isEditable}

                                        on:click={() => editor.chain().focus().toggleTextAlign('center').run()}
                                        disabled={!isEditable}
                                        >
                                        <Iconify iconId={"material-symbols-light:format-align-justify-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- Align Right -->
                                <Tooltip text="Align Right">
                                    <button 
                                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                                        class:cursor-pointer={isEditable}
                                        class:cursor-not-allowed={!isEditable}

                                        on:click={() => editor.chain().focus().toggleTextAlign("right").run()}
                                        disabled={!isEditable}
                                        >
                                        <Iconify iconId={"material-symbols-light:format-align-right-rounded"} />
                                    </button>
                                </Tooltip>

                                <!-- Align Justify -->
                                <Tooltip text="Align Justify">
                                    <button 
                                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                                        class:cursor-pointer={isEditable}
                                        class:cursor-not-allowed={!isEditable}

                                        on:click={() => editor.chain().focus().toggleTextAlign("justify").run()}
                                        disabled={!isEditable}
                                        >
                                        <Iconify iconId={"material-symbols-light:format-align-center-rounded"} />
                                    </button>
                                </Tooltip>
                            </div>
                    {/if}


                </div>

                <!-- Vertical Divider -->
                <div class="h-6 border-l border-gray-300 mx-1"></div>

                <!-- Highlight -->
                <Tooltip text="Highlight">
                        <button 
                            class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                            class:cursor-pointer={isEditable}
                            class:cursor-not-allowed={!isEditable}

                            on:click={() => editor.chain().focus().toggleHighlight().run()}
                            disabled={!isEditable}
                            >
                            <Iconify iconId={"material-symbols-light:format-ink-highlighter-outline-rounded"} />
                        </button>
                </Tooltip>

                <!-- Vertical Divider -->
                <div class="h-6 border-l border-gray-300 mx-1"></div>

                <!-- Orderd List -->
                <Tooltip text="Orderd List">
                    <button 
                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={() => editor.chain().focus().toggleOrderedList().run()}
                        disabled={!isEditable}
                        >
                        <Iconify iconId={"material-symbols-light:format-list-numbered-rounded"} />
                    </button>
                </Tooltip>

                <!-- Unorder List -->
                <Tooltip text="Unorderd List">
                    <button 
                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={() => editor.chain().focus().toggleBulletList().run()}
                        disabled={!isEditable}
                        >
                        <Iconify iconId={"material-symbols-light:format-list-bulleted-rounded"} />
                    </button>
                </Tooltip>

                <!-- Vertical Divider -->
                <div class="h-6 border-l border-gray-300 mx-1"></div>

                <!-- Subscript -->
                <Tooltip text="Subscript">
                    <button 
                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={() => editor.chain().focus().toggleSubscript().run()}
                        disabled={!isEditable}
                        >
                        <Iconify iconId={"material-symbols-light:subscript-rounded"} />
                    </button>
                </Tooltip>

                <!-- Superscript -->
                <Tooltip text="Superscript">
                    <button 
                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={() => editor.chain().focus().toggleSuperscript().run()}
                        disabled={!isEditable}
                        >
                        <Iconify iconId={"material-symbols-light:superscript-rounded"} />
                    </button>
                </Tooltip>

                <!-- Vertical Divider -->
                <div class="h-6 border-l border-gray-300 mx-1"></div>

                <!-- Image-->
                <Tooltip text="Images">
                    <button 
                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={() => editor.chain().focus().toggleOrderedList().run()}
                        disabled={!isEditable}
                        >
                        <Iconify iconId={"material-symbols-light:image-outline-rounded"} />
                    </button>
                </Tooltip>

                <!-- Vertical Divider -->
                <div class="h-6 border-l border-gray-300 mx-1"></div>

                <!-- Web -->
                <div>

                    <!-- Web Button -->
                    <button 
                        class="flex flex-row text-sm font-semibold rounded-full text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={(() => ddWeb = !ddWeb)}
                        disabled={!isEditable}
                        >
                        <Iconify iconId={"pepicons-pencil:internet"} />
                        <Iconify iconId={"material-symbols-light:arrow-drop-down-rounded"} height={20} />
                    </button>

                    {#if ddWeb}
                        <div use:clickOutside on:click_outside={(() => ddWeb = false )} in:fly={{}} out:fly={{}} class="p-1 rounded bg-white absolute shadow z-10">
                            
                            <!-- Link -->
                            <Tooltip text="Link">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                                    class:cursor-pointer={isEditable}
                                    class:cursor-not-allowed={!isEditable}

                                    on:click={() => editor.chain().focus().toggleLink({ href: "https://example.com" }).run()}
                                    disabled={!isEditable}

                                    >
                                    <Iconify iconId={"material-symbols-light:link-rounded"} />
                                </button>
                            </Tooltip>

                            <!-- Code -->
                            <Tooltip text="Syntaxted Code">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                                    class:cursor-pointer={isEditable}
                                    class:cursor-not-allowed={!isEditable}

                                    on:click={() => editor.chain().focus().toggleCodeBlock().run()}
                                    disabled={!isEditable}
                                    >
                                    <Iconify iconId={"material-symbols-light:code-blocks-outline-rounded"} />
                                </button>
                            </Tooltip>

                            <!-- Youtube -->
                            <Tooltip text="YouTube Video">
                                <button 
                                    class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                                    class:cursor-pointer={isEditable}
                                    class:cursor-not-allowed={!isEditable}

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

                <!-- Vertical Divider -->
                <div class="h-6 border-l border-gray-300 mx-1"></div>

                <!-- Undo -->
                <Tooltip text="Undo">
                    <button 
                        class:bg-gray-200={!editor.can().undo()}
                        class:hover:bg-gray-200={!editor.can().undo()}
                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full  text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={() => editor.chain().focus().undo().run()}
                        disabled={!isEditable}
                        >
                        <Iconify style={"color: text-primary-500"} iconId={"material-symbols-light:undo-rounded"} />
                    </button>
                </Tooltip>

                <!-- Redo -->
                <Tooltip text="Redo">
                    <button
                        class:bg-gray-200={!editor.can().redo()}
                        class:hover:bg-gray-200={!editor.can().redo()}
                    
                        class="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full text-gray-800 hover:bg-gray-100 "

                        class:cursor-pointer={isEditable}
                        class:cursor-not-allowed={!isEditable}

                        on:click={() => editor.chain().focus().redo().run()}
                        >
                        <Iconify iconId={"material-symbols-light:redo-rounded"} />
                    </button>
                </Tooltip>

                <!-- Char Limit / Locked -->
                <div class="absolute right-0 mr-4">
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
        <div 
            class="p-2 min-h-36 h-full outline-none focus:outline-none border-none list-inside"
            
            class:cursor-pointer={isEditable}
            class:cursor-not-allowed={!isEditable}
            bind:this={element} 
        />
    </div>
</div>


