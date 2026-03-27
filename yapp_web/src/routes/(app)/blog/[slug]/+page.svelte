<script lang="ts">
	import { goto } from "$app/navigation";
	import BlogPostViewer from "$lib/svelteComponents/blog/BlogPostViewer.svelte";
	import SmallAuthorCard from "$lib/svelteComponents/display/Profile/Author/SmallAuthorCard.svelte";
	import { onMount } from "svelte";


	export let data;
    $: blogPost = data.blogPost;

    function switchVersion(event) {
        const newVersionId = event.target.value;
        goto(`?version=${newVersionId}`, { keepFocus: true, noScroll: true });
    }

</script>


<div class="w-full h-full">

	{#if !blogPost}
		<p>BlogPost not found</p>
	{:else if !blogPost.currentVersion}
		<p>This Version is currently not public. Try changeing to another Version!</p>
	{:else}

		<div class="max-w-380 px-2 sm:px-4 lg:px-6 mx-auto grid lg:grid-cols-4 gap-y-8 lg:gap-y-0 lg:gap-x-6">
			
			<!-- Content -->
			<div class="lg:col-span-3 py-8">
				<BlogPostViewer 
					blogPost={blogPost}
					on:switchVersion={switchVersion}	
				/>
				
			</div>


			<!-- Sidebar -->
			<div class="lg:col-span-1 lg:w-full lg:h-full lg:bg-linear-to-r lg:from-background lg:via-transparent lg:to-transparent">
				<div class="sticky top-0 inset-s-0 py-8 lg:ps-8">
					
					<!-- Author -->
					<div class="group flex items-center gap-x-3">
						<SmallAuthorCard authorId={blogPost.authorId}/>
					</div>
					<!-- End Avatar Media -->

					<hr />

					<!-- Other Blogs -->
					<div class="space-y-6">

						<!-- <a class="group flex items-center gap-x-6 focus:outline-hidden" href="#">
							<div class="grow">
							<span class="text-sm font-bold text-foreground group-hover:text-primary-hover group-focus:text-primary-focus">
								5 Reasons to Not start a UX Designer Career in 2022/2023
							</span>
							</div>

							<div class="shrink-0 relative rounded-lg overflow-hidden size-20">
							<img class="size-full absolute top-0 start-0 object-cover rounded-lg" src="https://images.unsplash.com/photo-1567016526105-22da7c13161a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&q=80" alt="Blog Image">
							</div>
						</a>

						<a class="group flex items-center gap-x-6 focus:outline-hidden" href="#">
							<div class="grow">
							<span class="text-sm font-bold text-foreground group-hover:text-primary-hover group-focus:text-primary-focus">
								If your UX Portfolio has this 20% Well Done, it Will Give You an 80% Result
							</span>
							</div>

							<div class="shrink-0 relative rounded-lg overflow-hidden size-20">
							<img class="size-full absolute top-0 start-0 object-cover rounded-lg" src="https://images.unsplash.com/photo-1542125387-c71274d94f0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&q=80" alt="Blog Image">
							</div>
						</a>

						<a class="group flex items-center gap-x-6 focus:outline-hidden" href="#">
							<div class="grow">
							<span class="text-sm font-bold text-foreground group-hover:text-primary-hover group-focus:text-primary-focus">
								7 Principles of Icon Design
							</span>
							</div>

							<div class="shrink-0 relative rounded-lg overflow-hidden size-20">
							<img class="size-full absolute top-0 start-0 object-cover rounded-lg" src="https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&q=80" alt="Blog Image">
							</div>
						</a> -->
					</div>
				</div>
			</div>
			<!-- End Sidebar -->
			
		</div>

    {/if}
</div>




