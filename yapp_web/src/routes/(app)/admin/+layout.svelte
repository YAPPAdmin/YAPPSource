<script lang="ts">
	import "../../app.css";
	// import { afterNavigate } from "$app/navigation";
	import Header from "$lib/adminComponents/Header.svelte";
	import 'iconify-icon'
    import Footer from "$lib/adminComponents/Footer.svelte";

	// afterNavigate(() => {
	// 	// @ts-ignore
	// 	window.HSStaticMethods.autoInit();
	// });

</script>

<div class="w-screen">

	<Header></Header>

	<div class="w-30 h-screen lg:ml-64 lg:p-12 p-10">
		<slot class="h-screen w-full"/>
		<!-- <Footer></Footer> -->
	</div>



</div>    

