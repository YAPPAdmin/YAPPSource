<script lang="ts">
	import { page } from "$app/state"	

	import ChangeEmail from "$lib/svelteComponents/settings/profile/ChangeEmail.svelte";
	import ChangeUser from "$lib/svelteComponents/settings/profile/ChangeUser.svelte";
	import ChangePassword from "$lib/svelteComponents/settings/profile/ChangePassword.svelte"
    import { User } from "$lib/utils/auth/User";

	let user = page.data.session.user
	let updateUser = user


</script>

{#if updateUser && user}
<div class="flex justify-center items-center min-h-screen">

  <div class="min-w-fit">

    <h1>Profile Settings</h1>
    <hr class="!border mb-8">

    <div class="space-y-12">

    <ChangeUser user={user} />

    <ChangeEmail user={user} />

    <ChangePassword user={user} />

    </div>
  </div>

</div>
{/if}
