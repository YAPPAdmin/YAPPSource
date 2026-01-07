<script lang="ts">  
    export let lable: String = "Lable Missing!";
    export let iconName: String = "material-symbols-light:help-outline-rounded";
    export let helperText: String = "";

    let validEmail: Boolean = false;

    // https://svelte.dev/repl/c233f0db93fa4f3ba3f503fefd6faa7d?version=3.16.0
    export let EmailInputExportValue = "";

    function validateEmail(email: string): Boolean {
        // https://regexr.com/3e48o
        const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g; 
        return re.test(email);
    }

    $: validEmail = validateEmail(EmailInputExportValue);
</script>

<!-- https://preline.co/docs/input.html -->
<div class="max-w-sm space-y-3 my-4">
    <div class="relative">
        <input 
            bind:value={EmailInputExportValue} 
            type="email" 
            id="hs-floating-input-email" 
            class="peer p-3 block w-full border-4 rounded-lg text-sm placeholder:text-transparent focus:outline-none disabled:opacity-50 disabled:pointer-events-none
            focus:pt-6 focus:pb-2 
            [&:not(:placeholder-shown)]:pt-6
            [&:not(:placeholder-shown)]:pb-2
            autofill:pt-6
            autofill:pb-2
            {validEmail ? 'border-teal-500 focus:border-teal-500 focus:ring-teal-500' : 'border-red-500 focus:border-red-500 focus:ring-red-500'}" 
            placeholder="you@email.com"
            aria-describedby="email-helper-text"
        >

        {#if !EmailInputExportValue}
            <label for="hs-floating-input-email" class="absolute top-0 start-0 p-4 flex items-center h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 origin-[0_0] peer-disabled:opacity-50 peer-disabled:pointer-events-none
                peer-focus:scale-90
                peer-focus:translate-x-0.5
                peer-focus:-translate-y-1.5
                peer-focus:text-gray-500 
                peer-[:not(:placeholder-shown)]:scale-90
                peer-[:not(:placeholder-shown)]:translate-x-0.5
                peer-[:not(:placeholder-shown)]:-translate-y-1.5
                peer-[:not(:placeholder-shown)]:text-gray-500 text-gray-500">
                <iconify-icon icon={iconName} height={20} inline={true}></iconify-icon>{lable}
            </label>
        {/if}

        {#if helperText}
            <p class="mt-1 text-sm {validEmail ? 'text-teal-600' : 'text-red-600'}" id="email-helper-text">{helperText}</p>
        {/if}

        <p class="mt-1 text-sm {validEmail ? 'text-teal-600' : 'text-red-600'}">
            {validEmail ? 'Looks good!' : 'Please enter a valid email address.'}
        </p>

        <div class="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
            {#if validEmail}
                <iconify-icon icon="material-symbols-light:check-circle-outline-rounded" class="text-teal-600" height={24}></iconify-icon>
            {:else}
                <iconify-icon icon="material-symbols-light:error-outline-rounded" class="text-red-600" height={24}></iconify-icon>
            {/if}
        </div>
    </div>
</div>
