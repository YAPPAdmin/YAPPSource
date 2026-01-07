<script lang="ts">
  import Iconify from "../iconify/Iconify.svelte";

    export let likes: number = 0;
    export let dislikes: number = 0;

    // Calculate rating
    const totalVotes = likes + dislikes;
    const rating = totalVotes === 0 ? 0 : (likes / totalVotes) * 5;

	const stars = Array(5).fill(0).map((_, i) => {
		if (rating >= i + 1) return 'full';
		if (rating >= i + 0.5) return 'half';
		return 'empty';
	});
</script>


<!-- https://preline.co/docs/ratings.html -->
<!-- Rating -->
<div class="flex items-center space-x-0">
	{#each stars as star}
		<!-- Full Star -->
		{#if star === 'full'}
            <span class="w-5">
                <Iconify iconId={"material-symbols-light:star-rate-rounded"} style={"color: orange"} height={36}/>
            </span>

		<!-- Half Star (optional, use full icon for now) -->
		{:else if star === 'half'}
            <span class="w-5">
                <Iconify iconId={"material-symbols-light:star-rate-half-rounded"} style={"color: orange"} height={36}/>  
            </span>

		<!-- Empty Star -->
		{:else}
            <span class="w-5">
                <Iconify iconId={"material-symbols-light:star-rate-outline-rounded"} style={"color: orange"} height={36}/>  
            </span>
		{/if}
	{/each}
</div>
<!-- End Rating -->