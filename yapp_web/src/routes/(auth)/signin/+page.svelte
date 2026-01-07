<script lang="ts">
	import 'iconify-icon'
	import { signIn } from "@auth/sveltekit/client";
	import Divider from '$lib/svelteComponents/base/Divider.svelte';
	import Iconify from '$lib/svelteComponents/iconify/Iconify.svelte';
  	import { onMount } from 'svelte';
	import { page } from "$app/state"	
  	import { popupStack } from '$lib/popups/popup';
	import { validateEmail } from '$lib/utils/auth/authUtils';
	import Tooltip from '$lib/svelteComponents/base/Tooltip.svelte';
	import { goto } from '$app/navigation';

	let password: string;
	let email: string;
	let magicEmail: string;


onMount(() => {

	// Serverside Auth Error Hendling
	const error = page.url.searchParams.get("error");
	const code = page.url.searchParams.get("code");

	if (!error) return;

	console.log(error, code)

	if(error == "CredentialsSignin") {
		if(code == "user_not_found") {
			console.log("BING")

			popupStack.open({
				type: "text",
				title: "User not Found!",
				message: "Seams like you do not have an account yet!",
				variant: "modal",
				buttons: [{
					label: "Sign Up",
					action: () => {
						goto("/signup");
					}
				}]
			})
		} else if(code == "invalid_password") {
			popupStack.open({
				type: "text",
				title: "Invalid Password",
				message: "The password you entered is incorrect. Please try again.",
				variant: "modal",
				buttons: [{
					label: "Reset Password",
					action: () => {
						goto("/reset-password");
					}
				}]
			})
		} else if(code == "missing_fields"){
			popupStack.open({
				type: "text",
				title: "Missing Fields",
				message: "Please fill out all fields before signing in",
				variant: "modal",
			})
		} else {
			popupStack.open({
				type: "text",
				title: "Something Went Wrong",
				message: "An unexpected error occurred. Please try again in a moment.",
				variant: "modal",
			})
		}

		const newUrl = new URL(window.location.href);
		newUrl.searchParams.delete("error");
		newUrl.searchParams.delete("code");

		goto(newUrl.toString(), { replaceState: true });

	}
})


</script>

<!-- Background -->
<div class="bg-gradient-to-br from-secondary-500 to-primary-500 min-h-screen flex items-center justify-center px-4">
	
	<!-- Signin Page -->
	<div class="bg-background-500 p-4 my-6 sm:p-7 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-w-md rounded-xl shadow-lg">
	
		<!-- Switch to signup -->
		<div class="text-center">
			<h1 class="block text-2xl font-bold text-primary-400">Sign in</h1>
			<p class="mt-2 text-sm text-primary-500">
				Don't have an account yet?
				<a class="text-highlight-500 decoration-2 hover:underline focus:outline-none focus:underline font-medium " href="/signup">
					Sign up here
				</a>
			</p>
		</div>	

		<!-- SignIn -->
		<div class="mt-5">

			<!-- AuthProvider -->
			<div class="flex flex-col gap-2">
			<!-- GitHub Login -->
				<button on:click={() => signIn("github", {callbackUrl: "/", redirect: true})} type="button" class="authProviderButton">
					<Iconify iconId={"logos:github-icon"} height={24}></Iconify>
					Sign in with GitHub
				</button>

				<!-- Google Login -->
				<button on:click={() => signIn("github", {callbackUrl: "/", redirect: true})} type="button" class="authProviderButton">
					<Iconify iconId={"logos:google-icon"} height={24}></Iconify>
					Sign in with Google
				</button>
			</div>

			<!-- Divider -->
			<Divider></Divider>

			<!-- User/Password Login -->
			<div class="wrapper-form">

				<!-- Email Entry -->
				<div>
					<!-- Lable -->
					<div class="flex justify-between items-center">
						<label for="email" class="inputLabel">Email Address</label>
					</div>

					<!-- Email Input -->
					<div class="relative">
						<input required bind:value={email} type="email" id="email" name="email" class="input">
					</div>

				</div>

				<!-- Password Entry -->
				<div class="mt-4">
					<!-- Lable -->
					<div class="flex justify-between items-center">
						<label for="password" class="inputLabel">Password</label>
						<a class="inline-flex items-center gap-x-1 text-sm text-highlight-500 decoration-2 hover:underline focus:outline-none focus:underline font-medium" href="/">Forgot password?</a>
					</div>

					<!-- Password Input -->
					<div class="relative">
						<input required bind:value={password} type="password" id="password" name="password" class="input">
					</div>

				</div>


				<button on:click={() => signIn("credentials", {password, email, callbackUrl: "/", redirect: true})} class="defaultButtonFullWidth"
					disabled={!email || !password}	
				>
					Sign In
				</button>
			</div>

			<!-- Divider -->
			<Divider></Divider>


			<!-- Magic Link Login -->
			<div class="wrapper-form">

				<div class="flex justify-between items-center">
					<h2 class="block font-bold text-primary-500">Sign in with a Magic Link</h2>
					
					<Tooltip text={"We'll send a secure login link to your email. No password needed. Clicking the link in your email signs you in instantly"}>
						<Iconify  iconId={"material-symbols-light:help-outline-rounded"} button={true} height={30}></Iconify>
					</Tooltip>


				</div>

				<!-- Email Entry -->
				<div class="mt-4">
					<!-- Lable -->
					<div class="flex justify-between items-center">
						<label for="magicEmail" class="inputLabel">Email Address</label>
					</div>

					<!-- Email Input -->
					<div class="relative">
						<input required bind:value={magicEmail} type="email" id="magicEmail" name="magicEmail" class="input">
					</div>
				</div>

				<p class=" text-gray-600 text-sm font-thin">
					Enter your email address and we'll send you a magic link. Clicking this link will securely log you into your account - no password needed!
				</p>

				<button on:click={() => signIn("nodemailer", {email: magicEmail, callbackUrl: "/", redirect: true})} class="defaultButtonFullWidth" disabled={!validateEmail(magicEmail)}>
					Send Magic Mail
				</button>

			</div>
		</div>
	</div>
</div>



