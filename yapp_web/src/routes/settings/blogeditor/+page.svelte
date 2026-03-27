<script lang="ts">
	import { page } from "$app/state";
	import { BlogPost, BlogRegEntry } from "$lib/utils/blog/blog";
	import Carousel from "$lib/svelteComponents/base/Carousel.svelte";
	import SmallBlogCard from "$lib/svelteComponents/blog/SmallBlogCard.svelte";
	import Table from "$lib/svelteComponents/display/Table.svelte";
	import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
  	import { onMount } from "svelte";
	import { popupStack } from "$lib/popups/popup";
	import { goto } from "$app/navigation";
	import { newBlogStack } from "$lib/utils/blog/NewBlogStore/newBlogStore";
    import Image from "$lib/svelteComponents/display/Images/ImageCard.svelte"
  	import { formatDate, formatTime } from "$lib/utils/util";
  import ImageCard from "$lib/svelteComponents/display/Images/ImageCard.svelte";

    let preloadRegistry = page.data.blogRegistry;
	let authorLookup = page.data.authorLookup;
	
	let blogPostReg: BlogRegEntry[] = [];

	let carouselContent;

	async function reloadRegistry() {
        const params = new URLSearchParams({
            getRegistry: "true",
        });

        const result = await fetch(`/api/blog?${params.toString()}`);

		if(!result.ok) {
			popupStack.open({
				title: "Error reloading the Blog Registry",
				variant: "toast",
				type: "text",
				message: "Something went wrong trying to reload the blog registry"
			});
			return;
		}

		const data = await result.json();
		if(data) blogPostReg = data.registry;
    }
	
	$: if(page.data.blogRegistry) {
		blogPostReg = page.data.blogRegistry.map(entry => new BlogRegEntry(
			entry.id,
			new Date(entry.creationDate), 
			entry.authorId,
			entry.title,
			entry.description,
			entry.titleImageId,
			entry.metadata
		));
	}
	
	async function deleteBlog(blogPostId: string) {
        const params = new URLSearchParams({
            blogPostId: blogPostId,
        });

		const result = await fetch(`/api/blog?${params.toString()}`, {
			method: "DELETE"
		})
	}


</script>

<div class="p-8 space-y-16">

	<div class="m-0 flex entrys-center justify-between">
		<h1>Blog Overview</h1>
		<button 
			on:click|stopPropagation={(() => newBlogStack.open({}))}
			class="m-0! flex entrys-center gap-2 defaultButton"
		>
			<Iconify iconId={"material-symbols-light:add-circle-outline-rounded"} style={"color: white"} inline={true}/>
			New Post
		</button>
	</div>		
	<hr class="border! mb-16!">

	<!-- All Blogposts table view -->
	<div>
		<!-- Tabel View -->
		<h2 class="">All Blogposts</h2>

		<div class="px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
			<div class="w-full overflow-x-auto bg-layer rounded-xl shadow-2xs">
								
				<!-- Table -->
				<table class="min-w-full divide-y divide-table-line">
					<thead class="bg-muted">
						<tr>
							<th scope="col" class="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3 text-start">
							<div class="flex entrys-center gap-x-2">
								<span class="text-xs font-semibold uppercase text-foreground">
								Name
								</span>
							</div>
							</th>

							<th scope="col" class="px-6 py-3 text-end"></th>
						</tr>
					</thead>

					<tbody class="divide-y divide-table-line">
						{#each blogPostReg as entry}
							<tr class="even:bg-primary-900 hover:bg-primary-800 hover transition-colors duration-300">

								<td class="size-px whitespace-nowrap ps-6 lg:ps-3 xl:ps-0 pe-6 py-3">
									<div class="flex entrys-center gap-x-3 h-12">
										<div class="ml-2 overflow-hidden rounded-full h-10 aspect-square">
											{#if entry.titleImageId}
												<ImageCard src={entry.titleImageId} width={500}/>
											{/if}
										</div>

										<div class="grow">
											<span class="block text-sm font-semibold text-foreground">{entry.title}</span>
											<span class="block text-sm text-muted-foreground-1">{authorLookup[entry.authorId] ?? "Unknown Author"}</span>
										</div>
									</div>
								</td>

								<td class="h-px w-72 whitespace-nowrap">
									<div class="px-6 py-3">
										<span class="block text-sm font-semibold text-foreground">Director</span>
										<span class="block text-sm text-muted-foreground-1">Human resources</span>
									</div>
								</td>

								<td class="size-px whitespace-nowrap">
								<div class="px-6 py-3">
									<span class="py-1 px-1.5 inline-flex entrys-center gap-x-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
									<svg class="size-2.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
										<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
									</svg>
									Active
									</span>
								</div>
								</td>

								<td class="size-px whitespace-nowrap">
								<div class="px-6 py-3">
									<div class="flex entrys-center gap-x-3">
									<span class="text-xs text-muted-foreground-1">1/5</span>
									<div class="flex w-full h-1.5 bg-surface-1 rounded-full overflow-hidden">
										<div class="flex flex-col justify-center overflow-hidden bg-secondary" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
									</div>
									</div>
								</div>
								</td>

								<td class="size-px whitespace-nowrap">
									<div class="px-6 py-3">
										<span class="text-sm text-muted-foreground-1">{formatDate(entry.creationDate)} {formatTime(entry.creationDate)}</span>
									</div>
								</td>
								
								<td class="size-px whitespace-nowrap">
								<div class="px-6 py-1.5 flex items-center justify-center">
									<a class="inline-flex entrys-center gap-x-1 text-sm text-primary decoration-2 hover:underline focus:outline-hidden focus:underline font-medium" href={`/settings/blogeditor/${entry.id}`}>
										Edit
									</a>
									<p class="ml-2 mr-1">|</p>
									<button on:click={(() => {deleteBlog(entry.id)})}>
										<Iconify iconId={"material-symbols-light:delete-outline-rounded"} style={"color: red"}/>
									</button>
								</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- Footer -->
				<div class="px-6 py-4 grid gap-3 md:flex md:justify-between md:entrys-center border-t border-gray-500">
					<div>
						<p class="text-sm text-muted-foreground-2">
							<span class="font-semibold text-foreground">{blogPostReg.length}</span> results
						</p>
					</div>


					<div class="inline-flex gap-x-2">
						<button type="button" class="defaultButton">
							<Iconify iconId={"material-symbols-light:arrow-back-ios-rounded"} style={"color: white"}/>
							Prev
						</button>

						<button type="button" class="defaultButton">
							Next
							<Iconify iconId={"material-symbols-light:arrow-forward-ios-rounded"} style={"color: white"}/>
						</button>
					</div>

				</div>

			</div>
		</div>
	</div>
</div>