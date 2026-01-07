<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { User } from "$lib/utils/auth/User";
    import { validatePassword } from "$lib/utils/auth/authUtils";
    import { onMount } from "svelte";


    export let user: User

    let oldPassword: string | undefined = undefined;
    let newPassword: string | undefined = undefined;
    let newPasswordConfirm: string | undefined = undefined;

    let changePasswordUnlocked = false;
    let resetUnlocked = false;

    // Password complexity requirements
    const allowedSpecialChars = "@!\\\"§$%&/()=?{}[]#+-*~|;:,.<>€£¥öäüÖÄÜ";
	let passwordLength: boolean = false;
	let passwordLowercase: boolean = false;
	let passwordUppercase: boolean = false;
	let passwordNumbers: boolean = false;
	let passwordSpecialChar: boolean = false;
	let passwordContainsOnlyAllowedChars: boolean = true;


	let passwordsMatching: boolean | undefined = undefined;
	let newPasswordMatchesOldPassword: boolean | undefined = undefined;
	let passwordComplexity: boolean = false;


    onMount(() => {
        if (!(user instanceof User)) {
            user = User.fromJSON(user);
        }
    })

    function resetPassword() {
        oldPassword = undefined;
        newPassword = undefined;
        newPasswordConfirm = undefined;

        unlockReset()
        unlockPasswordChange()
    }

    function checkPasswordRequirements(password: string) {
		({
			passwordComplexity,
			passwordLength,
			passwordLowercase,
			passwordUppercase,
			passwordNumbers,
			passwordSpecialChar,
			passwordContainsOnlyAllowedChars
		} = validatePassword(password));
	}

    function unlockPasswordChange() {
        passwordsMatching = undefined;
        newPasswordMatchesOldPassword = undefined;
        passwordLength = false;
        passwordLowercase = false;
        passwordUppercase = false;
        passwordNumbers = false;
        passwordSpecialChar = false;

        if(newPassword) {
            checkPasswordRequirements(newPassword)
        }
        
        if(newPassword && newPasswordConfirm) {
            passwordsMatching = newPassword == newPasswordConfirm;
        }

        if(newPassword && oldPassword) {
            newPasswordMatchesOldPassword = newPassword == oldPassword;
        }


        changePasswordUnlocked = !!(passwordsMatching && passwordComplexity && !newPasswordMatchesOldPassword);

        unlockReset()
        return
    }

    function unlockReset() {
        resetUnlocked = !!(oldPassword || newPassword || newPasswordConfirm)
    }

    async function handlePasswordChange() {
        if(!resetUnlocked) return;

        console.log("Changeing Password");

        const result = await fetch("/api/changeUser/changePassword/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: user.getId(),
                oldPassword: oldPassword,
                newPassword: newPassword,
            })
        })


        if(result.ok) {
            // Update displayed user data
            const data = await result.json()

            // Reset update state
            resetPassword()
        }else {
            const data = await result.json()
            console.log(data)
        }

    }



</script>



{#if user && user instanceof User}
    <div class="mx-auto">

        <!-- Heading -->
        <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-800">
                Password
            </h2>
            <p class="text-sm text-gray-600">
                Change your Password
            </p>
        </div>

        <form>
            <!-- Properties -->
            <div class="grid sm:grid-cols-12 gap-2 sm:gap-6">

                <!-- Old Password Label -->
                <div class="sm:col-span-3">
                    <div class="inline-block">
                        <label for="af-account-phone" class="inline-block text-sm text-gray-800 mt-2.5">
                            Confirm old Password
                        </label>
                    </div>
                </div>
                
                <!-- Old Password -->
                <div class="sm:col-span-9">
                    <div class="flex flex-col">
                        <input 
                            type="password" 
                            class="py-1.5 sm:py-2 px-3 pe-11 block w-full border-gray-200 shadow-2xs -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg sm:text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 " 
                            placeholder="Old Password"
                            autocomplete="current-password"
                            bind:value={oldPassword}
                            on:input={unlockPasswordChange}
                            
                        >
				        
                        <!-- {#if oldEmail && !oldEmailValid && oldEmail != undefined}
                            <p class="mx-2 !text-error-default">Invalid Email</p>
                        {/if}

                        {#if oldEmail && !wrongOldEmail && wrongOldEmail != undefined}
                            <p class="mx-2 !text-error-default">Wrong Email</p>
                        {/if} -->
                        
                    </div>
                </div>


                <!-- New Password Label -->
                <div class="sm:col-span-3">
                    <div class="inline-block">
                        <label for="af-account-phone" class="inline-block text-sm text-gray-800 mt-2.5">
                            New Password
                        </label>
                    </div>
                </div>
                
                <!-- New Password -->
                <div class="sm:col-span-9">
                    <div class="flex flex-col">
                        <input 
                            type="password" 
                            class="py-1.5 sm:py-2 px-3 pe-11 block w-full border-gray-200 shadow-2xs -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg sm:text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 " 
                            placeholder="New Password"
                            autocomplete="new-password" 
                            bind:value={newPassword}
                            on:input={unlockPasswordChange}
                        >
                        
                        
                        <!-- New Password Requirements -->
                        <div class="mb-3">
                            {#if passwordContainsOnlyAllowedChars}
                                    
                                <ul class="space-y-1 text-sm text-gray-500">

                                    <!-- Password Length -->
                                    <li class=" flex items-center gap-x-2">
                                        {#if passwordLength}
                                            <Iconify iconId={"material-symbols-light:check-rounded"} height={20} style={"color: text-success-default"}></Iconify>
                                            <p class="text-green-500">Minimum number of characters is 8.</p>
                                        {:else}
                                            <Iconify iconId={"material-symbols-light:close-rounded"} height={20} style={"color: text-error-default"}></Iconify>
                                            <p class="text-error-default">Minimum number of characters is 8.</p>
                                        {/if}
                                    </li>

                                    <!-- Password Lowercase -->
                                    <li class=" flex items-center gap-x-2">
                                        {#if passwordLowercase}
                                            <Iconify iconId={"material-symbols-light:check-rounded"} height={20} style={"color: text-success-default"}></Iconify>										<p class="text-green-500">Should contain lowercase.</p>
                                        {:else}
                                            <Iconify iconId={"material-symbols-light:close-rounded"} height={20} style={"color: text-error-default"}></Iconify>
                                            <p class="text-error-default">Should contain lowercase.</p>
                                        {/if}
                                    </li>

                                    <!-- Password Uppercase -->
                                    <li class=" flex items-center gap-x-2">
                                        {#if passwordUppercase}
                                            <Iconify iconId={"material-symbols-light:check-rounded"} height={20} style={"color: text-success-default"}></Iconify>
                                            <p class="text-green-500">Should contain uppercase.</p>
                                        {:else}
                                            <Iconify iconId={"material-symbols-light:close-rounded"} height={20} style={"color: text-error-default"}></Iconify>
                                            <p class="text-error-default">Should contain uppercase.</p>
                                        {/if}
                                    </li>

                                    <!-- Password Numbers -->
                                    <li class=" flex items-center gap-x-2">
                                        {#if passwordNumbers}
                                            <Iconify iconId={"material-symbols-light:check-rounded"} height={20} style={"color: text-success-default"}></Iconify>
                                            <p class="text-green-500">Should contain numbers.</p>
                                        {:else}
                                            <Iconify iconId={"material-symbols-light:close-rounded"} height={20} style={"color: text-error-default"}></Iconify>
                                            <p class="text-error-default">Should contain numbers.</p>
                                        {/if}
                                    </li>

                                    <!-- Password Special Char -->
                                    <li class=" flex items-center gap-x-2">
                                        {#if passwordSpecialChar}
                                            <Iconify iconId={"material-symbols-light:check-rounded"} height={20} style={"color: text-success-default"}></Iconify>
                                            <p class="text-green-500">Should contain special characters.</p>
                                        {:else}
                                            <Iconify iconId={"material-symbols-light:close-rounded"} height={20} style={"color: text-error-default"}></Iconify>

                                            <div>
                                                <p class="text-error-default">Should contain special characters.</p>
                                                <p>You can choose from these: {allowedSpecialChars}</p>
                                            </div>	
                                        {/if}
                                    </li>

                                    <li class=" flex items-center gap-x-2"> 
                                        {#if newPasswordMatchesOldPassword }
                                            <Iconify iconId={"material-symbols-light:close-rounded"} height={20} style={"color: text-error-default"}></Iconify>
                                            <p class="text-error-default">New Password can not be old Password</p>
                                        {/if}

                                    </li>

                                </ul>

                            {:else}
                                <p class="!text-error-default my-1 !text-sm max-w-92">
                                    Your password contains special characters that are not allowed! 
                                    Please use characters from this list:
                                </p>

                                <ul class="space-y-1 text-sm !text-primary-200">
                                    <li class="ml-2 flex items-center gap-x-2">
                                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                                    </li>

                                    <li class="ml-2 flex items-center gap-x-2">
                                        abcdefghijklmnopqrstuvwxyz
                                    </li>

                                    <li class="ml-2 flex items-center gap-x-2">
                                        0123456789
                                    </li>

                                    <li class="ml-2 flex items-center gap-x-2">
                                        {allowedSpecialChars}
                                    </li>
                                </ul>
                            {/if}
                        </div>
                    </div>
                </div>



                <!-- New Password Confirm Label -->
                <div class="sm:col-span-3">
                    <div class="inline-block">
                        <label for="af-account-phone" class="inline-block text-sm text-gray-800 mt-2.5">
                            Confirm new Password
                        </label>
                    </div>
                </div>
                
                <!-- New Password Confirm -->
                <div class="sm:col-span-9">
                    <div class="flex flex-col">
                        <input 
                            type="password" 
                            class="py-1.5 sm:py-2 px-3 pe-11 block w-full border-gray-200 shadow-2xs -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg sm:text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 " 
                            placeholder="Confirm Password"
                            autocomplete="new-password"
                            bind:value={newPasswordConfirm}
                            on:input={unlockPasswordChange}
                        >



				        {#if !passwordsMatching && passwordsMatching != undefined}
                            <p class="mx-2 !text-error-default">Passwords not the same</p>
                        {/if} 


                    </div>
                </div>
                        

                
            </div>


            <!-- Buttons -->
            <div class="mt-5 flex justify-end gap-x-2">
                
                <!-- Cancel Button -->
                <button 
                    type="button" 
                    class="!bg-highlight-500 hover:!bg-highlight-600 defaultButton"
                    on:click={resetPassword}
                    disabled={!resetUnlocked}
                >
                    Cancel
                </button>

                <!-- Save Button -->
                <button 
                    on:click={handlePasswordChange}
                    type="button" 
                    class="defaultButton"            
                    disabled={!changePasswordUnlocked}
                >
                    Save changes
                </button>


            </div>
        </form>
    </div>


{/if}