<script lang="ts">
    import { popupStack } from "$lib/popups/popup";
    import UpdatedUser from "$lib/svelteComponents/display/Message/Messages/ChangeUser/UpdatedUser.svelte";
    import UpdatedUserError from "$lib/svelteComponents/display/Message/Messages/ChangeUser/UpdatedUserError.svelte";
    import { User } from "$lib/utils/auth/User";
    import { validateUserName } from "$lib/utils/auth/authUtils";
    import { onMount } from "svelte";


    export let user: User;

    let changeUserUnlocked = false;
    let updatedUserConfig;

    // Update Date Holders
    let username = "";
    let firstname = "";
    let lastname = "";
    let phone = "";
    let image = "";
    let birthdate = "";
    let pronouns = "";

    // Error States
    let usernameError = "";
    let firstnameError = "";
    let lastnameError = "";


    onMount(() => {
        if (!(user instanceof User)) {
            user = User.fromJSON(user);
        }

        updatedUserConfig = user.toJSON();

        if(user) {
            username = user.getUsername();
            firstname = user.getFirstname();
            lastname = user.getLastName();
            image = user.getImage();
        }

        unlockUserChange()
    })


    function resetUser() {
        username = user.getUsername();
        firstname = user.getFirstname();
        lastname = user.getLastName();
        image = user.getImage();

        unlockUserChange()
    }


    function validateInput() {

        // Start with clear errors
        usernameError = "";
        firstnameError = "";
        lastnameError = "";

        // Check for valid username
        if(!validateUserName(username)) { 
            usernameError = "Username must (only) contain alphabetic letters and numbers!";
        }

        if(usernameError || firstnameError || lastnameError ) {
            return false;
        }
        return true;
    }

    function unlockUserChange() {
        validateInput()

        const hasChanges =
            username !== user.getUsername() ||
            firstname !== user.getFirstname() ||
            lastname !== user.getLastName() ||
            image !== user.getImage();

        const hasErrors = (usernameError || firstnameError || lastnameError);

	    changeUserUnlocked = hasChanges && !hasErrors;    
    }


    async function updateUser() {
        const result = await fetch("/api/user/", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                firstname: firstname,
                lastname: lastname,
                phone: phone,
                image: image,
                birhtdate: birthdate,
                pronouns: pronouns,
            })
        })

        console.log("Result: ", await result.json())

        if(result.ok) {
            // Update displayed user data
            const data = await result.json()

            // Show updated data
            user = User.fromJSON(data.user)

            // Reset update state
            unlockUserChange()

            popupStack.open({
                type: "text",
                title: "Updated your Settings",
                message: "Successfully updated your user settings!",
                variant: "modal"
            })


        // Show Successfull Update Notification
        }else {
            popupStack.open({
                type: "text",
                title: "Error Updated your Settings",
                message: "An Error occured whilest trying to update your user Settings!",
                variant: "modal"
            })
        }   
    }

</script>

 


<!-- https://preline.co/examples/application-form-layouts.html -->
{#if user && user instanceof User}
    <div class="mx-auto">

        <!-- Heading -->
        <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-800">
                Profile
            </h2>
            <p class="text-sm text-gray-600">
                Manage your name, password and account settings.
            </p>
        </div>

        <form>
            <!-- Properties -->
            <div class="grid sm:grid-cols-12 gap-2 sm:gap-6">

                <!-- Profile Pic Label -->
                <div class="sm:col-span-3">
                    <label class="inline-block text-sm text-gray-800 mt-2.5">
                        Profile photo
                    </label>
                </div>
                
                <!-- Profile Pick -->
                <div class="sm:col-span-9">
                    <div class="flex items-center gap-5">
                        <img class="inline-block size-16 rounded-full ring-2 ring-white" src="https://preline.co/assets/img/160x160/img1.jpg" alt="Avatar">
                        <div class="flex gap-x-2">
                            <div>
                                <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50">
                                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                    Upload photo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>



                <!-- Username Label -->
                <div class="sm:col-span-3">
                    <label class="inline-block text-sm text-gray-800 mt-2.5">
                        Username
                    </label>
                </div>

                <!-- Username -->
                <div class="sm:col-span-9">
                    <div class="sm:flex">
                        <input 
                            type="text" 
                            placeholder="Username"
                            bind:value={username}
			                on:input={unlockUserChange}
			                class={`py-1.5 px-3 block w-full rounded-lg border ${usernameError ? '!border-red-500 !focus:border-red-500 !focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'} sm:text-sm`}
                        > 

                        {#if true}
                            <p class="text-sm !text-red-600 mt-1">{usernameError}</p>
                        {/if}

                    </div>
                </div>


                <!-- Full Name Label -->
                <div class="sm:col-span-3">
                    <label for="af-account-full-name" class="inline-block text-sm text-gray-800 mt-2.5">
                        Full name
                    </label>
                </div>
                
                <!-- Full Name -->
                <div class="sm:col-span-9">
                    <div class="sm:flex">
                        
                        <!-- Input Firstname -->
                        <input 
                            type="text" 
                            placeholder="First Name"
                            bind:value={firstname}
                            on:input={unlockUserChange}
                        >
                        
                        <!-- Input Lastname -->
                        <input 
                            type="text" 
                            placeholder="Last Name"
                            bind:value={lastname}
                            on:input={unlockUserChange}
                        >
                    </div>
                </div>
                


                <!-- Phone Label -->
                <div class="sm:col-span-3">
                    <div class="inline-block">
                        <label for="af-account-phone" class="inline-block text-sm text-gray-800 mt-2.5">
                            Phone
                        </label>
                        <span class="text-sm text-gray-400">
                            (Optional)
                        </span>
                    </div>
                </div>
                
                <!-- Phone -->
                <div class="sm:col-span-9">
                    <div class="sm:flex">
                        <input id="af-account-phone" type="text" class="py-1.5 sm:py-2 px-3 pe-11 block w-full border-gray-200 shadow-2xs -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg sm:text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="+x(xxx)xxx-xx-xx">
                    </div>
                </div>
                        


                <!-- Bio Label -->
                <div class="sm:col-span-3">
                    <label for="af-account-bio" class="inline-block text-sm text-gray-800 mt-2.5">
                        BIO
                    </label>
                </div>
                
                <!-- Bio -->
                <div class="sm:col-span-9 shadow-xl rounded-xl">
                    <textarea id="af-account-bio" class="py-1.5 sm:py-2 px-3 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none" 
                    rows="6" 
                    placeholder="Type your message..."
                    
                    ></textarea>
                </div>
                
            </div>


            <!-- Buttons -->
            <div class="mt-5 flex justify-end gap-x-2">
                
                <!-- Cancel Button -->
                <button 
                    type="button" 
                    class="!bg-highlight-500 hover:!bg-highlight-600 defaultButton"
                    on:click={resetUser}
                    disabled={!changeUserUnlocked}
                >
                    Cancel
                </button>

                <!-- Save Button -->
                <button 
                    on:click={updateUser}
                    type="button" 
                    class="defaultButton"            
                    disabled={!changeUserUnlocked}
                >
                    Save changes
                </button>


            </div>
        </form>
    </div>
{/if}


