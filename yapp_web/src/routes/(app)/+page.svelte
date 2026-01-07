<!-- Test Preline component -->
<script lang="ts">
	import { page } from "$app/state"	
	import { onMount } from "svelte";
	import { popupStack } from "$lib/popups/popup";
	import CustomComponentRenderer from "$lib/svelteComponents/homepage/CustomComponentRenderer.svelte";

	let layout = page.data.layout;
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



<div class="w-full h-full p-2 my-10">
	<CustomComponentRenderer layout={layout}/>
</div>
