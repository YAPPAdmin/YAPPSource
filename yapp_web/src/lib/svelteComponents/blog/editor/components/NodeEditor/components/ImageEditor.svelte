<script lang="ts">
  import { onDestroy } from "svelte";

    export let editor: any;

    $: currentAttrs = editor ? editor.getAttributes("imageResize") : {};

    let src = "";
    let alt = "";
    let title = "";
    let fileId = "";

    function loadAttributes() {
        if (!editor) return;
        const attrs = editor.getAttributes("imageResize");
        src = attrs.src || "";
        alt = attrs.alt || "";
        title = attrs.title || "";
        fileId = attrs.fileId || "";
    }

    function applyChanges() {
        if(!editor) return;
        editor.chain().updateAttributes("imageResize", {
            src: src,
            alt: alt,
            title: title,
            fileId: fileId
        }).run();
    }

    $: if (editor) {
        loadAttributes(); // Load immediately when component mounts
        editor.on("selectionUpdate", loadAttributes);
    }

    onDestroy(() => {
        if (editor) {
            editor.off("selectionUpdate", loadAttributes);
        }
    });
</script>

<div class="w-full flex flex-col space-y-2">



    <!-- Title -->
    <div class="w-full flex flex-col justify-center">
        <label for="img-title" class="block text-sm font-medium text-gray-700 mb-1">Image Title</label>
        <input
            id="img-title"
            type="text"
            bind:value={title}
            on:input={applyChanges}
            placeholder="Image Name"

        />
    </div>

    <!-- Alt -->
    <div class="w-full flex flex-col justify-center">
        <label for="img-alt" class="block text-sm font-medium text-gray-700 mb-1">Alternative Description</label>
        <input
            id="img-at"
            type="text"
            bind:value={alt}
            on:input={applyChanges}
            placeholder="Describe the Image"
        />
    </div>

</div>