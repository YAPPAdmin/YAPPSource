<script lang="ts">
    import { API } from "$lib/utils/apiUtils";
    import { User } from "$lib/utils/auth/User";
    import { BlogRegEntry, isBlogPostNew } from "$lib/utils/blog";
    import { formatDate } from "$lib/utils/util";
    import { onMount } from "svelte";

    export let blogPost: BlogRegEntry;
    export let cachedAuthor: undefined = undefined;

    let isDescriptionVisible = false; 

    const isNew = isBlogPostNew(blogPost.publicDate);

    let imgSrc: string | undefined = undefined;

    let isloading = true;
    let imageLoaded = false;

    let author: User | undefined = undefined;

    onMount(async () => {
        const img = new Image();

        imgSrc = blogPost.titleImage

        if(imgSrc){
            img.src = imgSrc;
            img.onload = () => {
                isloading = false;
                imageLoaded = true;
            }
        } else {
            imgSrc = "https://dummyimage.com/800x400/cccccc/ffffff&text=No+Image"
        }


        // Fetch author if no cached author is provided
        if(cachedAuthor) {
            author = cachedAuthor;
            
        } else if(blogPost.authorId) {
            const result = await API.getAuthor(blogPost.authorId);
            if(result) {
                author = result;
            }
        }

    })
        
    function toggleDescription(event) {
        if(isDescriptionVisible) {

        } else {
            event.preventDefault();
            event.stopPropagation();
            isDescriptionVisible = true;
        }
    }


</script>

<a
    class="w-72 min-h-112 flex flex-col group bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg focus:outline-hidden focus:shadow-lg transition relative" 
    on:click={toggleDescription}
    on:mouseenter={() => isDescriptionVisible = true}
    on:mouseleave={() => isDescriptionVisible = false}
    href={`/blog/${blogPost.id}`}
>

    <!-- Cover Image Container -->
    <div class="items-center flex justify-center w-full  h-40 lg:h-64 rounded-t-xl overflow-hidden">
       
        <!-- New Badge -->
        {#if isNew}
            <span class="absolute top-2 right-2 inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-primary-500 text-white z-10">
                New!
            </span>
        {/if}

        <!-- Cover Image -->
        {#if isloading && !imageLoaded}
            <div class="animate-pulse bg-gray-200 h-full w-full absolute top-0 left-0 object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out rounded-t-xl">
                &nbsp;
            </div>

            <!--class="size-full absolute top-0 left-0 object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out rounded-t-xl" -->
        {:else}

            <img
                class="h-full absolute top-0 left-0 object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out rounded-t-xl"
                src={imgSrc}
                alt={blogPost.title}
            >

            
        {/if}

    </div>

    <!-- Content -->
    <div class="p-4 md:p-5">

        {#if blogPost == undefined}

        <!-- SKELETON -->
            <div class="absolute top-0">
                <!-- Title -->
                <h3 class="font-bold !m-0 text-lg">
                    &nbsp;
                </h3>

                <!-- Author -->
                <div>
                    <span class="!text-xs">&nbsp;</span>
                </div>

            </div>
            
        {:else}

            <!-- -->
            <div class="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-sm bg-white/50 rounded-t-2xl transition-all duration-300 ease-in-out"> 
                <!-- Title -->
                <a href={`/blog/${blogPost.id}`}>
                    <h3 class="min-h-[calc(1em*2+0.5rem)] hover:underline font-bold !m-0 text-lg transition-all duration-300 ease-in-out group-hover:mb-2 text-shadow-md">
                        {blogPost.title}
                    </h3> 
                </a>

                <div class="flex flex-wrap items-center justify-between">
                    <!-- Author -->
                    <div>
                        {#if author instanceof User}
                            <!-- Author -->
                            <p class="!text-xs">By <strong><a class="hover:underline" href={"/profile/" + author.getId()}>{author.getUsername()}</a></strong></p>

                        {:else if author == undefined}
                            <!-- No Author found -->
                            <p class="!text-xs text-gray-500">No Author found ¯\_(ツ)_/¯</p>

                        {:else}
                            <!-- Author Skeleton -->
                            <p class="animate-pulse bg-gray-200 rounded-xl w-1/2 !text-xs">&nbsp;</p>

                        {/if}
                    </div>

                    <!-- Public Date -->   
                    <div>
                        {#if blogPost.publicDate}
                            <p class="!text-xs text-gray-500">{formatDate(blogPost.publicDate)}</p>
                        {/if}
                    </div>
                </div>

                <!-- Description (initially hidden) -->
                <div class={`transition-all duration-300 ease-in-out ${isDescriptionVisible ? 'max-h-60' : 'max-h-0 overflow-hidden'}`}>
                    <p class="mt-2 text-primary-800 text-sm">
                        {blogPost.description}
                    </p>
                </div>

            </div>
        {/if}


    </div>
</a>