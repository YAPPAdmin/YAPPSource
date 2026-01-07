<script lang="ts">
    import { validatePassword } from "$lib/utils/authUtils";
    import Iconify from "../iconify/Iconify.svelte";

    export let password = "";
    let confirmPassword = "";
    let passwordsMatch: boolean | undefined = undefined;

    const allowedSpecialChars = "@!\\\"§$%&/()=?{}[]#+-*~|;:,.<>€£¥öäüÖÄÜ";

    // Declare variables
    let passwordLength: boolean | undefined = undefined;
    let passwordLowercase: boolean | undefined = undefined;
    let passwordUppercase: boolean | undefined = undefined;
    let passwordNumbers: boolean | undefined = undefined;
    let passwordSpecialChar: boolean | undefined = undefined;
    let passwordContainsOnlyAllowedChars: boolean | undefined = true;
    let passwordComplexity: boolean | undefined = undefined;

    export let passwordValid: boolean = false;

    // Reactive validation
    $: {
        const result = validatePassword(password);
        passwordLength = result.passwordLength;
        passwordLowercase = result.passwordLowercase;
        passwordUppercase = result.passwordUppercase;
        passwordNumbers = result.passwordNumbers;
        passwordSpecialChar = result.passwordSpecialChar;
        passwordContainsOnlyAllowedChars = result.passwordContainsOnlyAllowedChars;
        passwordComplexity = result.passwordComplexity && passwordContainsOnlyAllowedChars;
        passwordValid = passwordComplexity && passwordsMatch
    }

    $: passwordsMatch = password && confirmPassword ? password === confirmPassword : undefined;


</script>

<div>
    <!-- Password Entry -->
    <div class="mt-4">
        <!-- Lable -->
        <div class="flex justify-between items-center">
            <label for="password" class="inputLabel">Password</label>
        </div>

        <!-- Password Input -->
        <div class="relative">
            <input required bind:value={password} type="password" id="password" name="password">
        </div>

        <!-- Password Requirements -->
        {#if password}
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
                                <Iconify iconId={"material-symbols-light:check-rounded"} height={20} style={"color: text-success-default"}></Iconify>										
                                <p class="text-green-500">Should contain lowercase.</p>
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

                        <!-- Passwords Matching -->
                        <li class=" flex items-center gap-x-2">
                            {#if passwordsMatch}
                                <Iconify iconId={"material-symbols-light:check-rounded"} height={20} style={"color: text-success-default"}></Iconify>
                                <p class="text-green-500">Passwords Matching</p>
                            {:else}
                                <Iconify iconId={"material-symbols-light:close-rounded"} height={20} style={"color: text-error-default"}></Iconify>
                                <p class="text-error-default">Passwords Matching</p>
                            {/if}
                        </li>

                    </ul>

                {:else}
                    <h4 class="text-error-default mt-2 text-sm font-semibold">
                        Your password contains special characters that are not allowed! Please use characters from this list:
                    </h4>
                    <ul class="space-y-1 text-sm text-primary-200">
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
        {/if}
    </div>

    <!-- Confirm Password Entry -->
    <div class="mt-4">
        <!-- Lable -->
        <div class="flex justify-between items-center">
            <label for="confirmPassword" class="inputLabel">Confirm Password</label>
            {#if !passwordsMatch && passwordsMatch != undefined}
                <p class="inline-flex items-center gap-x-1 text-sm !text-red-600 decoration-2">Passwords not matching</p>
            {/if}
        </div>

        <!-- Password Input -->
        <div class="relative">
            <input required bind:value={confirmPassword} type="password" id="confirmPassword" name="confirmPassword" class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ">
        </div>
    </div>
</div>  