<script lang="ts">
	import "../../app.css"
	import 'iconify-icon'
  	import { page } from "$app/state";
  	import SideNav from "$lib/svelteComponents/base/SideNav.svelte";
  	import Footer from "$lib/svelteComponents/base/Footer.svelte";
	import { User } from "$lib/utils/auth/User";


	let user = page.data.session.user ? User.fromJSON(page.data.session.user) : null;

</script>


<div>

	<SideNav user={user}>
		<slot />
	</SideNav>


</div>


