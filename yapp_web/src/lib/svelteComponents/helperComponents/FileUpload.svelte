<script lang=ts>
	import  { UploadFile } from "$lib/classes";
	import {v4 as uuidv4} from 'uuid';
	import FileUploadCard from "./FileUploadCard.svelte";
  	import { fileToBase64 } from "$lib/utils/util";

	export const maxFileSize = 9989660
	export const allowedFileTypes: string[] = [".jpg", ".jpeg", ".png", ".webp"];

	let test = "";

	let fileInput: HTMLInputElement | null = null;
	let fileList: UploadFile[] = [];
	let isDragging = false;

	async function upload() {

		let response = await fetch("/api/upload", {
			method: "Post",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ files: fileList })
		})

		response = await response.json()
		console.log("RESPONSE: ", response)
		return
	}

	async function handleChange() {
		if(!fileInput?.files) return;
		await handleFiles(fileInput.files);
	} 

	async function handleFiles(files: FileList) {
		if(!files || files.length === 0) return;
			
		for(let i = 0; i<files.length; i++) {

			let sizeError = false;
			if(files[i].size > maxFileSize) {
				sizeError = true;
			}

			const binaryImage: string = await fileToBase64(files[i])

			if(files[i]) {
				let NewFile = new UploadFile(
					binaryImage,
					uuidv4(),
					files[i].name,
					100,
					sizeError,
					false
				);
				fileList.push(NewFile);
				fileList = fileList;
				console.log("FOR FILE: ", NewFile)
			}
		}
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragging = false;

		if(event.dataTransfer?.files) {
			await handleFiles(event.dataTransfer.files)
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	function deleteFile(id:string) {
		fileList = fileList.filter(file => file.fileID !== id);
		fileList = fileList;
	}


</script>



<div id="hs-file-upload-with-limited-file-size">
	
	<!-- File Drop Zone -->
	<div class="p-12 flex justify-center bg-white border border-dashed border-gray-300 rounded-xl transition-all duration-300" 
		role="region"
		aria-label="File Drop Zone"
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
	>
		<div class="text-center">

			{#if fileList.length > 0}
				<p>
					<button on:click={upload} class="pe-1 mb-2 font-medium text-blue-600 hover:text-blue-300">
						Click to upload
					</button>
				</p>
			{/if}

				{#if isDragging}
					<span class="inline-flex justify-center items-center size-16 bg-gray-100 text-gray-800 rounded-full">
						<button on:click={upload}><iconify-icon icon="material-symbols-light:place-item-rounded" height={36}></iconify-icon></button>
					</span> 
				{:else if fileList.length > 0}
					<button class="inline-flex justify-center items-center size-16 bg-blue-600 hover:bg-blue-300 text-gray-800 rounded-full">
						<iconify-icon icon="material-symbols-light:upload-2-outline-rounded" height={36}></iconify-icon>
					</button>
				{:else}
					<span class="inline-flex justify-center items-center size-16 bg-gray-100 text-gray-800 rounded-full">
						<iconify-icon icon="material-symbols-light:upload-rounded" height={36}></iconify-icon>
					</span>
				{/if}

  
			
			<div class="mt-4 flex flex-wrap justify-center text-sm leading-6 text-gray-600">
				{#if isDragging}
					<span class="pe-1 font-medium text-gray-800">
						Drop your file here
					</span>
				{:else}
					<span class="pe-1 font-medium text-gray-800">
						Drop your file here or
					</span>
					<label for="fileInput" class="bg-white font-semibold text-blue-600 hover:text-blue-700 rounded-lg decoration-2 hover:underline focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2">browse</label>
					<input
						bind:this={fileInput}
						type="file"
						id="fileInput"
						name="fileInput"
						required
						multiple
						style="visibility:hidden;"
						accept={allowedFileTypes.join(",")}
						on:change={handleChange}
						class="sr-only"
					/>
				{/if}
			</div>
  
			<p class="mt-1 text-xs text-gray-400">
				Pick a file up to 2MB.
			</p>

		</div>
	</div>
  
	<div class="mt-4 mb-4 space-y-2 empty:mt-0" data-hs-file-upload-previews=""></div>

	{#if fileList.length > 0}
		{#each fileList as file}
			<FileUploadCard 
				file={file} 
				onDelete={() => deleteFile(file.fileID)}
			/>
		{/each}
	{/if}
</div>





