<script lang="ts">
	import type { UploadFile } from "$lib/classes";
	export let file: UploadFile;
	export let onDelete: () => void;

	$: progressWidth = `width: ${file.uploadProgress}%`

	let deleteButtonHover = false;

</script>

<div class="p-3 my-3 bg-white border border-solid border-gray-300 rounded-xl">

	<div class="mb-1 flex justify-between items-center">
		<div class="flex items-center gap-x-3">
			<span class="size-10 flex justify-center items-center border border-gray-200 text-gray-500 rounded-lg">
				{#if file}
					<img class="rounded-lg" src={URL.createObjectURL(file.file)} alt={file.file.name}>
				{/if}
			</span>
		
			<div>
				<p></p>
				<p class="text-sm font-medium text-gray-800">
					{#if file}
						<p>{file.file.name}</p>
					{/if}
					<!-- <span class="truncate inline-block max-w-[300px] align-bottom" data-hs-file-upload-file-name=""></span>.<span data-hs-file-upload-file-ext=""></span> -->
				</p>

				<p class="text-xs text-gray-500"></p>
				
				{#if file.fileSizeError}
					<p class="text-xs text-red-500">File exceeds size limit.</p>
				{/if}
			</div>
		</div>


		<div class="flex items-center gap-x-2">
			<!-- Overall Error Display -->
			{#if file.generalError}
				<span class="hs-tooltip [--placement:top] inline-block" data-hs-file-upload-file-error="">
					<span class="hs-tooltip-toggle text-red-500 hover:text-red-800 focus:outline-none focus:text-red-800">
				
						<iconify-icon icon="material-symbols-light:error-outline-rounded" height={24}></iconify-icon>
						
						<span class="hs-tooltip-content max-w-[100px] hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm" role="tooltip">
							An error occurred - please try again
						</span>
					</span>
				</span>
			{:else if file.fileSizeError}
				<!-- File Size Error Icon -->
				<span class="hs-tooltip [--placement:top] inline-block" data-hs-file-upload-file-error="">
					<span class="hs-tooltip-toggle text-red-500 hover:text-red-800 focus:outline-none focus:text-red-800">
				
						<iconify-icon icon="material-symbols-light:error-outline-rounded" height={24}></iconify-icon>
						
						<span class="hs-tooltip-content max-w-[100px] hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm" role="tooltip">
							Please try to upload a file smaller than 1MB.
						</span>
					</span>
				</span>
			{/if}

			<!-- Delete Button -->
			<button on:click={onDelete} type="button" class="text-gray-500 hover:text-red-600 h-fit"
				on:mouseenter={() => deleteButtonHover = true} 
				on:mouseleave={() => deleteButtonHover = false}
			>
				{#if deleteButtonHover}
					<iconify-icon icon="material-symbols-light:delete-forever-outline-rounded" height={24}></iconify-icon>
				{:else}
					<iconify-icon icon="material-symbols-light:delete-outline-rounded" height={24}></iconify-icon>
				{/if}

			
			</button>
		</div>
	</div>

	<!-- Progress -->
	<div class="flex items-center gap-x-3 whitespace-nowrap">
		{#if file.fileSizeError}
			<div class="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar">
				<div class="flex flex-col justify-center rounded-full overflow-hidden bg-red-600 text-xs text-white text-center whitespace-nowrap transition-all duration-500 hs-file-upload-complete:bg-green-500" style="width: 100%" data-hs-file-upload-progress-bar-pane=""></div>
			</div>
		{:else}
			<div class="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar">
				<div class="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition-all duration-500 hs-file-upload-complete:bg-green-500" style={progressWidth} data-hs-file-upload-progress-bar-pane=""></div>
			</div>

			<!-- Progress number -->
			<div class="w-10 text-end">
				<span class="text-sm text-gray-800">
					<span data-hs-file-upload-progress-bar-value="">{file.uploadProgress}%</span>
				</span>
			</div>
		{/if}
		<!-- Progress bar -->

	</div>


</div>
