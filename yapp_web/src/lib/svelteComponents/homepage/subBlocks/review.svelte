<script lang="ts" context="module">

    export type Review = {
        name: string,
        source?: string,
        rating: number,
        maxRating?: number,
        reviewCount?: number,
        type?: "stars" | "hearts",
        logo?: string,
        quote?: string,
    }

</script>

<script lang="ts">
    import { goto } from "$app/navigation";

    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";

    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { onMount } from "svelte";

    export let review: Review;

    let ratingCalc;
    let tooltipText = ""


    $: tooltipText = [
        review.rating ? `Rating: ${review.rating}/${review.maxRating ?? "?"}` : null,
        review.reviewCount ? `${review.reviewCount} Reviews` : null,
        review.source ? `Source: ${review.source}` : null,
        review.quote ? `"${review.quote}"` : null
    ]
        .filter(Boolean) // remove nulls
        .join(" - ");    // nice readable separator



    // Calculate Rating 
    function calcRating(rating: number, maxRating: number): ("full" | "half" | "empty")[] {
        if(!review.rating) return;

        const stars: ("full" | "half" | "empty")[] = [];

        // Rating can not exceed maxRating
        const safeRating = Math.min(rating, maxRating);

        const fullStars = Math.floor(safeRating);
        const hasHalfStar = safeRating % 1 >= 0.25 && safeRating % 1 < 0.75 //Half Star threshold
        const extraFull = safeRating % 1 >= 0.75 ? 1 : 0; //Round up

        // Add full stars
        for (let i = 0; i < fullStars + extraFull; i++) {
            stars.push("full");
        }

        // Add one half star if necessary
        if (hasHalfStar) {
            stars.push("half");
        }

        // Fill up with empty stars until maxRating
        while (stars.length < maxRating) {
            stars.push("empty");
        }

        return stars;
    }

    // Reroute to Review Source if possible
    function linkToSource(){
        if(review.source) {
            goto(review.source);
        }
    }
    
    onMount(() => {

        if(!review.maxRating || review.maxRating != undefined) {
            if(review.rating <= 5) {
                review.maxRating = 5;
            } else if(review.rating <= 10) {
                review.maxRating = 10;
            } else if(review.maxRating <= 100) {
                review.maxRating = 100;
            } else {
                review.maxRating = review.rating
            }
        }

        ratingCalc = calcRating(review.rating, review.maxRating);

    })

</script>

<!-- https://preline.co/examples/hero-sections.html -->

<!-- Rating -->
<Tooltip text={tooltipText}>
    <button on:click={linkToSource}   class="p-3 rounded-2xl shadow-xl w-fit transition transform hover:scale-105 hover:shadow-3xl">

        <div class="flex">
            {#if ratingCalc && review.type == "stars"}
                
                {#each ratingCalc as star, i}
                    {#if star == "full"}
                        <Iconify iconId={"material-symbols-light:star"} height={36} />
                    {:else if star == "half"}
                        <Iconify iconId={"material-symbols-light:star-half-rounded"} height={36} />
                    {:else}
                        <Iconify iconId={"material-symbols-light:star-outline-rounded"} height={36} />
                    {/if}
                {/each}
            
            {:else if ratingCalc && review.type == "hearts"}

                {#each ratingCalc as star, i}
                    {#if star == "full"}
                        <Iconify iconId={"line-md:heart-filled"} height={36} />
                    {:else if star == "half"}
                        <Iconify iconId={"line-md:heart-filled-half"} height={36} />
                    {:else}
                        <Iconify iconId={"line-md:heart"} height={36} />
                    {/if}
                {/each}

            {/if}
        </div>


        <p class="mt-3 text-sm text-gray-800">
            
            <!-- Rating -->
            <span class="font-bold">{review.rating || 0}</span> 
            
            <!-- Max Rating -->
            <span>/{review.maxRating || 0}</span>

            <!-- Rating Count -->
            {#if review.reviewCount}
                <span>- from <span class="font-semibold">{review.reviewCount || 0}</span> Reviews</span>
            {/if}

        </p>

        <div class="mt-3 ">
            <Tooltip text={review.name}>    
                {#if review.logo}
                    <img class="max-h-10" src={review.logo} alt={review.name}/>
                {:else}
                    <p>{review.name || "Empty Review"}</p>
                {/if}

            </Tooltip>
            
        </div>
    </button>
</Tooltip>

