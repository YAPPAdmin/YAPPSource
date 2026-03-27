<script lang="ts">
    export let editor: any;

    $: currentAttrs = editor ? editor.getAttributes("youtube") : {};
</script>

<div>
    <p>YouTube!</p>
</div>