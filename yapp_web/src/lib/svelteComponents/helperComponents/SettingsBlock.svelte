<script lang="ts">
    export let settingsName: string;
</script>

<div class="flex justify-between items-center w-full mt-12">
    <span class="ml-3">{settingsName}</span>
    <slot name="setting" class="ml-auto mr-3" />

</div>

<hr>