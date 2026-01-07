<script>
  import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";

</script>

<!-- Background -->
<div class="bg-gradient-to-br from-secondary-500 to-primary-500 min-h-screen flex items-center justify-center px-4">

	<!-- Signup Page -->
	<div class="bg-background-500 p-4 my-6 sm:p-7 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-w-md rounded-xl shadow-lg">
        <h1 class="w-full text-center">Email Verification Sent!</h1>

        <div class="mt-10">
            <!-- Link to mails -->
            <div class="mt-5 mx-10 flex justify-between space-x-4">
                <!-- Gmail -->
                <a target="_blank" href="https://mail.google.com/"><Iconify iconId={"logos:google-gmail"} button={true}></Iconify></a>
                
                <!-- Outlook -->
                <a target="_blank" href="https://mail.yahoo.com/"><Iconify iconId={"logos:microsoft-icon"} button={true}></Iconify></a>
          
                <!-- Yahoo -->
                <a target="_blank" href="https://mail.yahoo.com/"><Iconify iconId={"mdi:yahoo"} style={"color: rgb(96, 1, 210)"} button={true}></Iconify></a>

                <!-- Apple -->
                <a target="_blank" href="https://www.icloud.com/mail"><Iconify iconId={"logos:apple"} button={true}></Iconify></a>

            </div>
        </div>

        <div class="mt-10">
            <ul class="list-disc list-inside space-y-2">
                <li><strong>Check your spam folder</strong> - Sometimes, emails can end up in the spam folder by mistake.</li>
                <li><strong>Wait a few minutes</strong> - It might take a little time for the email to arrive.</li>
                <li><strong>Ensure correct email address</strong> - Make sure you entered the correct email address during sign-up.</li>
            </ul>
        </div>
    </div>
</div>