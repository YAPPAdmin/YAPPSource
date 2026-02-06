<script lang="ts">
    import { dev } from "$app/environment";
    import { cubicOut } from 'svelte/easing';
    import { uploadProgress } from "$lib/uploads/upload";
    import { formatByte } from "$lib/utils/util";
    import { fly, scale } from "svelte/transition";
    import Iconify from "../iconify/Iconify.svelte";
    import { tweened } from "svelte/motion";

    const progress = tweened(0, {
        duration: 400,
        easing: cubicOut
    });

    $: progress.set($uploadProgress.percentage);

</script>

<!-- https://preline.co/docs/file-uploading-progress-form.html -->
{#if $uploadProgress.isUploading}
    <div 
        class="min-w-80 lg:min-w-120 p-1"
        in:fly={{ x: 100, duration: 600, easing: cubicOut }}
        out:fly={{ x: 100, duration: 400 }}
    >
        <div class="mb-2 flex justify-between items-center">

            <!-- File Data -->
            <div class="flex items-center gap-x-3">

                <!-- Thumbnail -->
                <div 
                    class="relative size-8 flex justify-center items-center rounded-full overflow-hidden transition-all duration-500 ease-out"
                    class:scale-125={$uploadProgress.percentage === 100}
                    class:p-1={$uploadProgress.percentage < 100}
                    class:p-2={$uploadProgress.percentage === 100}
                >
                    <div 
                        class="absolute inset-0 rounded-full border-2 border-transparent transition-colors duration-500
                        {$uploadProgress.percentage < 100 
                            ? 'border-t-primary-500 border-r-primary-500 animate-spin' 
                            : 'border-success-500'}"
                    ></div>
                    
                    <div class="size-full flex justify-center items-center bg-white rounded-full z-10 overflow-hidden shadow-sm">
                        {#if $uploadProgress.percentage === 100}
                            <div in:scale={{ duration: 300, start: 0.5 }}>
                                <Iconify iconId="material-symbols-light:check-rounded" height={20} />
                            </div>
                        {:else if $uploadProgress.thumbnail}
                            <img src={$uploadProgress.thumbnail} alt="" class="size-full object-cover" />
                        {:else}
                            <Iconify iconId="material-symbols-light:image-outline-rounded" />
                        {/if}
                    </div>
                </div>

                <!-- Filename/size -->
                <div>
                    <p class="text-sm font-medium text-gray-800 dark:text-white">{$uploadProgress.fileName}</p>
                    <p class="text-xs text-gray-500 dark:text-neutral-500">{formatByte($uploadProgress.fileSize)}</p>
                </div>
            </div>
        </div>

        <!-- Progress Bar -->
        <div class="flex items-center gap-x-3 whitespace-nowrap">

            <!-- Bar -->
            <div class="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={$uploadProgress.percentage} aria-valuemin="0" aria-valuemax="100">
                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary-500 text-xs text-white text-center whitespace-nowrap transition duration-500" style="width: {$progress}%"></div>
            </div>

            <span class="!text-sm !text-gray-500">{$uploadProgress.percentage}%</span>
        </div>
    </div>
{/if}