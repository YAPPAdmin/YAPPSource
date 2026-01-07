<script lang="ts">
	import { page } from "$app/state";
	import { BlogPostN, BlogRegEntry } from "$lib/utils/blog";
	import Carousel from "$lib/svelteComponents/base/Carousel.svelte";
	import SmallBlogCard from "$lib/svelteComponents/blog/SmallBlogCard.svelte";
	import Table from "$lib/svelteComponents/display/Table.svelte";
	import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
  	import { onMount } from "svelte";
	import { popupStack } from "$lib/popups/popup";
	import { goto } from "$app/navigation";


	const user = page.data.user;
	const blogPostRegJSON = page.data.blogRegistry;

	let formatedBlogPostReg: BlogRegEntry[] = [];

	let carouselContent;


	onMount(() => {
		for(const entry of blogPostRegJSON) {
			formatedBlogPostReg.push(BlogPostN.fromJSON(entry))
		}

		carouselContent = formatedBlogPostReg.map((post) => ({
			component: SmallBlogCard,
			props: { blogPost: post }
		}));
	

	})

	async function newBlogPost() {
		console.log("Create new BlogPost")

		const result = await fetch("/api/blog", {
			method: "POST", 
			headers: { "Content-Type": "application/json" },
		})

		const data = await result.json()

		if(result.ok) {
			popupStack.open({
				type: "text",
				title: "Successfully created new BlogPost",
				message: "A new Blog Post has been created",
				buttons: [{ 
					label: "Take me there", 
					action: () => {
						goto(`/blog/${data.blogPost.id}`)
					}, 
				}],
			});

		} else {		
			console.log("DATA: ", data.errors)

			popupStack.open({
				type: "text",
				title: "Error creating new BlogPost",
				message: `An error occurred whilst trying to create a new BlogPost:\n\n${data.errors.map((err: string) => `- ${err}`).join("\n")}\n\nPlease share this information with your administrator if these errors persist.`,
				closeText: "Ok",
				variant: "modal"
			})
		}
	}



</script>

<div class="p-8 space-y-16">

	<div class="m-0 flex items-center justify-between">
		<h1>Blog Overview</h1>
		<button on:click={newBlogPost} class="!m-0 flex items-center gap-2 defaultButton">
			<Iconify iconId={"material-symbols-light:add-circle-outline-rounded"} style={"color: white"} inline={true}/>
			New Post
		</button>
	</div>		
	<hr class="!border !mb-16">


	<h2 class="!mb-6">Recent Blogposts</h2>
	
	{#if carouselContent}
		<Carousel content={carouselContent} />
	{/if}
	

	<h2 class="!mb-6">All Blogposts</h2>

	<!-- <Table content={blogPostReg} defaultVisibleColumns={["title", "author", "description", "likes", "dislikes", "category"]}/> -->

</div>

