<script lang="ts">
    import { popupStack } from "$lib/popups/popup";
    import ConfirmEmailChange from "$lib/svelteComponents/display/Message/Messages/ChangeUser/ConfirmEmailChange.svelte";
    import { User } from "$lib/utils/auth/User";
    import { validateUserName } from "$lib/utils/auth/authUtils";
    import { onMount } from "svelte";

    export let user: User


	let oldEmail: string | undefined = undefined;
	let newEmail: string | undefined = undefined;

    let changeEmailUnlocked = false;
    let resetUnlocked = false;

	let oldEmailValid: boolean = false;
	let newEmailValid: boolean = false;
	let emailMatch: boolean | undefined = undefined;
    let wrongOldEmail : boolean | undefined = undefined;

    onMount(() => {
        if (!(user instanceof User)) {
            user = User.fromJSON(user);
        }


    })

    function resetEmail() {
        oldEmail = "";
        newEmail = "";
    }

    function unlockEmailChange() {

        // Check if old and new email are the same
        emailMatch = oldEmail == newEmail;

        // Check for valid email
		if(oldEmail != undefined) {
			oldEmailValid = validateEmail(oldEmail)
		}

        // Check for valid email
		if(newEmail != undefined) {
			newEmailValid = validateEmail(newEmail)
		}

        // Check if old email truly is the old email
        wrongOldEmail = oldEmail == user.getEmail();

        changeEmailUnlocked = oldEmailValid && newEmailValid && !emailMatch;
        unlockReset()


    }

    function unlockReset() {
        resetUnlocked = !!(oldEmail || newEmail);
    }


    async function handleEmailChange() {
		if(!changeEmailUnlocked) return;

        console.log("Changeing email")

        const result = await fetch("/api/changeUser/changeEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify({
                id: user.getId(),
                oldEmail: oldEmail,
                newEmail: newEmail,
            })
        })


        if(result.ok) {
            // Update displayed user data
            const data = await result.json()

            popupStack.open({
                type: "text",
                title: "Update saved!",
                message: "Sucessfully updated you Email"
            })

            // Reset update state
            resetEmail()

        // Show Successfull Update Notification
        } else {
            popupStack.open({
                type: "text",
                title: "Update saved!",
                message: "Sucessfully updated you Email"
            })

        }

	}



</script>



{#if user && user instanceof User}
    <div class="mx-auto">

        <!-- Heading -->
        <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-800">
                Email
            </h2>
            <p class="text-sm text-gray-600">
                Change your Email Address
            </p>
        </div>

        <form>
            <!-- Properties -->
            <div class="grid sm:grid-cols-12 gap-2 sm:gap-6">

                <!-- Old Email Label -->
                <div class="sm:col-span-3">
                    <div class="inline-block">
                        <label for="af-account-phone" class="inline-block text-sm text-gray-800 mt-2.5">
                            Confirm old email
                        </label>
                    </div>
                </div>
                
                <!-- Old Email -->
                <div class="sm:col-span-9">
                    <div class="flex flex-col">
                        <input 
                            type="email" 
                            class="py-1.5 sm:py-2 px-3 pe-11 block w-full border-gray-200 shadow-2xs -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg sm:text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 " 
                            placeholder="Your old Email"
                            bind:value={oldEmail}
                            on:input={unlockEmailChange}
                            
                        >
				        
                        {#if oldEmail && !oldEmailValid && oldEmail != undefined}
                            <p class="mx-2 !text-error-default">Invalid Email</p>
                        {/if}

                        {#if oldEmail && !wrongOldEmail && wrongOldEmail != undefined}
                            <p class="mx-2 !text-error-default">Wrong Email</p>
                        {/if}
                        
                    </div>
                </div>


                <!-- New Email Label -->
                <div class="sm:col-span-3">
                    <div class="inline-block">
                        <label for="af-account-phone" class="inline-block text-sm text-gray-800 mt-2.5">
                            New Email
                        </label>
                    </div>
                </div>
                
                <!-- New Email -->
                <div class="sm:col-span-9">
                    <div class="flex flex-col">
                        <input 
                            type="email" 
                            class="py-1.5 sm:py-2 px-3 pe-11 block w-full border-gray-200 shadow-2xs -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg sm:text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 " 
                            placeholder="Your new Email"
                            bind:value={newEmail}
                            on:input={unlockEmailChange}
                        >

                        {#if newEmailValid && oldEmailValid && emailMatch && emailMatch != undefined}
                            <p class="mx-2 !text-error-default">New Email can't be old Email</p>
                        {/if}

				        {#if !newEmailValid && newEmail != undefined}
                            <p class="mx-2 !text-error-default">Invalid Email</p>
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
                    on:click={resetEmail}
                    disabled={!resetUnlocked}
                >
                    Cancel
                </button>

                <!-- Save Button -->
                <button 
                    on:click={handleEmailChange}
                    type="button" 
                    class="defaultButton"            
                    disabled={!changeEmailUnlocked}
                >
                    Save changes
                </button>


            </div>
        </form>
    </div>


{/if}