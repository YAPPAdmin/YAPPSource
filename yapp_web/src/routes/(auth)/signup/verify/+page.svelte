<script>
    import { signIn } from "@auth/sveltekit/client";
    
    export let data;
    const email = data.email;

    function handleVerification() {
        signIn("nodemailer", {email: email})
    }

</script>



<!-- Background -->
<div class="bg-gradient-to-br from-secondary-500 to-primary-500 min-h-screen flex items-center justify-center px-4">

    <div class="bg-background-500 p-4 sm:p-7 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-w-md rounded-xl shadow-lg">

        <h2 class="block text-2xl font-bold text-primary-400">Verify your Email</h2>

        <div class="mt-5">
            <p>We will send you a Verification Email to <strong>{email}</strong>. All you need to do is press the link we'll send you, and your email will be verified! </p>

            <!-- Email Verification Link -->
            <div class="wrapper-form">
                <button on:click={handleVerification} class="defaultButtonFullWidth">
                    Verify {email}
                </button>
            </div>
        </div>
    </div>

</div>