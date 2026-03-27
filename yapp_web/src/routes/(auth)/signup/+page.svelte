<script lang="ts">
	import { signIn } from "@auth/sveltekit/client";
	import Divider from '$lib/svelteComponents/base/Divider.svelte';
	import Iconify from '$lib/svelteComponents/iconify/Iconify.svelte';
	import { goto } from "$app/navigation";
	import { popupStack } from "$lib/popups/popup";
  	import NewPassword from "$lib/svelteComponents/input/NewPassword.svelte";
	// import { validatePassword, validateEmail } from "$lib/utils/auth/authUtils"

	let password: string;
	let passwordValid: boolean;
	let email: string;
	let username: string;

	let validEmail: boolean | undefined = undefined
	let signInUnlocked: boolean = false;
	let validUsername: boolean | undefined = undefined;

  	$: signInUnlocked = passwordValid && Boolean(username) && Boolean(validUsername) && Boolean(email) && Boolean(validEmail);

	async function handleSignup() {
		if(signInUnlocked) {

			try {
				const response = await fetch("/api/user", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",	
					},
					body: JSON.stringify({ username, email, password})
				})

				console.log("Response: ", response)

				if(response.ok) {
					goto(`/signup/verify?email=${email}`)
				} else {
					console.log("ERROR")
					const error = await response.json();

					if(error.error == "Missing or invalid required fields") {
						console.log("INVALID SIGNUP - ", error)
						// password = ""; confirmPassword = ""; username = ""; email = "";
					}

					if(error.error == "User already exists") { // User Already Exists
						popupStack.open({
							type: "text",
							title: "User Already Exists",
							message: "The user you are trying to create already exists. Try to sign in to that account or use another email.",
							variant: "modal"
						})
					}

				}
			}catch (error) {
				popupStack.open({
					type: "text",
					title: "An Error Occured",
					message: "The user you are trying to create already exists. Try to sign in to that account or use another email.",
					variant: "modal"
				})
			}


		}
	}


</script>

<!-- Background -->
<div class="bg-gradient-to-br from-secondary-500 to-primary-500 min-h-screen flex items-center justify-center px-4">

	<!-- Signup Page -->
	<div class="bg-background-500 p-4 my-6 sm:p-7 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-w-md rounded-xl shadow-lg">
		
		<!-- Switch to signup -->
		<div class="text-center">
			<h1 class="block text-2xl font-bold text-primary-400">Sign up</h1>
			<p class="mt-2 text-sm text-primary-500">
				Already have an account?
				<a class="text-highlight-500 decoration-2 hover:underline focus:outline-none focus:underline font-medium " href="/signin">
					Sign in here
				</a>
			</p>
		</div>	

		<!-- SignUp -->
		<div class="mt-5">

			<!-- AuthProvider -->
			<div class="flex flex-col gap-2">
				<button on:click={() => signIn("github", {callbackUrl: "/", redirect: true})} type="button" class="authProviderButton">
					<Iconify iconId={"logos:github-icon"} height={24}></Iconify>
					Create an account with GitHub
				</button>

				<!-- Google Login -->
				<button on:click={() => signIn("github", {callbackUrl: "/", redirect: true})} type="button" class="authProviderButton">
					<Iconify iconId={"logos:google-icon"} height={24}></Iconify>
					Create an account with Google
				</button>
			</div>

			<!-- Divider -->
			<Divider></Divider>

			<!-- User/Password Login -->
			<div class="wrapper-form">

				<!-- Username Entry -->
				<div class="mt-4">
					<!-- Lable -->
					<div class="flex justify-between items-center">
						<label for="username" class="inputLabel">User Name</label>
						{#if !validUsername && validUsername != undefined}
							<p class="inline-flex items-center gap-x-1 text-sm !text-error-default decoration-2">Invalid Username</p>
						{/if}
					</div>

					<!-- Username Input -->
					<div class="relative">
						<input required bind:value={username} on:input={(() => {validUsername = validateUserName(username)})} type="text" id="username" name="username" class="input">
					</div>
					
				</div>

				<!-- Email Entry -->
				<div class="mt-4">
					<!-- Lable -->
					<div class="flex justify-between items-center">
						<label for="email" class="inputLabel">Email Address</label>
						{#if !validEmail && validEmail != undefined}
							<p class="inline-flex items-center gap-x-1 text-sm !text-error-default decoration-2">Invalid Email</p>
						{/if}
					</div>

					<!-- Email Input -->
					<div class="relative">
						<!-- <input required bind:value={email} on:input={(() => {validEmail = validateEmail(email)})} type="email" id="email" name="email"> -->
					</div>

				</div>

				<NewPassword bind:password={password} bind:passwordValid={passwordValid}/>

				<!-- Sign In Button -->
				<button on:click={handleSignup} disabled={!signInUnlocked} class="defaultButtonFullWidth">
					Sign In
				</button>

			</div>
		</div>
	</div>
</div>