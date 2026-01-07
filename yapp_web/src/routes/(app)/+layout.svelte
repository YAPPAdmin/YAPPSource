<script lang="ts">
	import "../../app.css"
	import 'iconify-icon'
  	import { page } from "$app/state";
	import Footer from "$lib/svelteComponents/base/Footer.svelte";
	import Header from "$lib/svelteComponents/base/Header.svelte";
	import { User } from "$lib/utils/auth/User";
  	import { onMount } from "svelte";

	let user: User | undefined = page.data.session?.user

	onMount(() => {
		user = User.fromJSON(user)
	})

</script>

<div class="w-screen h-screen min-h-screen flex flex-col">
	<Header {user} ></Header>

	<main class="flex-grow">
		<slot />
	</main>

	<!-- <Footer></Footer> -->
</div>




