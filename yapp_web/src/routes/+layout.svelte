<script lang="ts">
	import Popup from "$lib/popups/Popup.svelte";
	import Uploads from "$lib/uploads/Uploads.svelte";
	import "../app.css";
	import 'iconify-icon'

</script>

<div class="flex flex-col">

	<main class="flex-grow">
		<slot />
		<Popup />
		<Uploads />
	</main>

</div>




