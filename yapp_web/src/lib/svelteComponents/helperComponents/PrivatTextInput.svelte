<script lang="ts">
    export let placeholder = "Enter Password"
    import { createEventDispatcher } from 'svelte';
    export let icon = "material-symbols-light:key-outline-rounded"
    export let PrivateInputExportValue = "";
    export let lable: string = "";
    let passwordVisible = false;

    // Work around for problems with dynamic types and bindings
    // https://svelte.dev/repl/77f694a1851d464b85b382f4f152cb8e?version=3.46.4
	const handleInput = ({ target }) => {
		PrivateInputExportValue = target.PrivateInputExportValue;
	};

    function togglePasswordVisibility() {
        passwordVisible = !passwordVisible;
    }

</script>

<div class="max-w-sm">
    <div class="relative">

        {#if lable}
            <label for="input-label" class="mb-2">{lable}</label>
        {/if}

        <input on:input={handleInput} type={passwordVisible ? 'text' : 'password'} placeholder="{placeholder}" on:input={handleInput} class="peer py-3 px-4 ps-11 block w-full bg-gray-300 border-2 border-gray-400 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" >
      
        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
            <iconify-icon icon="{icon}" height={24}></iconify-icon>
        </div>
      
        <button on:click={togglePasswordVisibility} type="button" class="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"> 
            {#if passwordVisible}
                <iconify-icon icon="material-symbols-light:visibility-rounded" height={24}></iconify-icon>
            {:else}
                <iconify-icon icon="material-symbols-light:visibility-off-rounded" height={24}></iconify-icon>
            {/if}
        </button>   
    </div>
</div>