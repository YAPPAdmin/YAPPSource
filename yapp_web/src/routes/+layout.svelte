<script lang="ts">
	import Popup from "$lib/popups/Popup.svelte";
	import Uploads from "$lib/uploads/Uploads.svelte";
  	import NewBlog from "$lib/utils/blog/NewBlogStore/NewBlog.svelte";
	import NewPage from "$lib/utils/pageEditor/NewPageStore/NewPage.svelte";
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import "../app.css";
	import 'iconify-icon'
	import { afterNavigate } from "$app/navigation";
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import NewBlogVersion from "$lib/utils/blog/NewVersionStore/NewBlogVersion.svelte";
	import NewPageLayoutVersion from "$lib/utils/pageEditor/NewVersionStore/NewPageLayoutVersion.svelte";

	// Vercel Speed Insights
	injectSpeedInsights();
	
	onMount(async () => {
        if (browser) {
            await import('preline/preline');
        }
    });

	afterNavigate(() => {
        // @ts-ignore
        if (browser && window.HSStaticMethods) {
            window.HSStaticMethods.autoInit();
        }
    });


</script>

<div class="flex flex-col">

	<main class="grow">
		<slot />
		<Popup />
		<Uploads />
		<NewBlog />
		<NewBlogVersion />
		<NewPageLayoutVersion />
		<NewPage />
	</main>

</div>




