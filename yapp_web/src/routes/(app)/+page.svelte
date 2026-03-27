<!-- Test Preline component -->
<script lang="ts">
	import { page } from "$app/state"	
	import { onMount } from "svelte";
	import { popupStack } from "$lib/popups/popup";
	import CustomComponentRenderer from "$lib/svelteComponents/homepage/CustomComponentRenderer.svelte";
	import { PageLayoutVersion } from "$lib/utils/pageEditor/PageLayoutVersion";

	$: version = page.data.version ? PageLayoutVersion.fromDbRecord(page.data.version) : undefined;
	let user = page.data.session?.user;

  	onMount(() => {

		// Check if the user has ben rerouted here from another page
		const rerouteParam = page.url.searchParams.get("from");
		
		// Rerout Popups
		if(user?.id) {
			switch(rerouteParam) {
				case "signin":
					popupStack.open({
						type: "text", 
						title: "Already Signed in",
						message: "You are already Signed In!",
						variant: "modal",
					})
					break;
				case "signup":
					popupStack.open({
						type: "text", 
						title: "Already Signed in",
						message: "You are already Signed In!",
						variant: "modal",
					});
					break;
				case "verification":
					popupStack.open({
						type: "text", 
						title: "Email Verified",
						message: "Youre Email has been verified!",
						variant: "modal",
					})
					break;
				default:
					break
			}
		}
	})

</script>



{#if version}
    <div class="w-full h-full">
        <CustomComponentRenderer version={version} />
    </div>
{:else}
    <p>Loading</p>
{/if}