<script>
	export let lable = "Lable Missing!";
	export let iconName = "material-symbols-light:help-outline-rounded";
	export let helperText = "";

	// https://svelte.dev/repl/c233f0db93fa4f3ba3f503fefd6faa7d?version=3.16.0
	export let TextInputExportValue = "";
	$: console.log(TextInputExportValue)

</script>





<!-- https://preline.co/docs/input.html -->
<div class="max-w-sm space-y-3 my-4">
  <div class="relative">

	

    <input bind:value={TextInputExportValue} type="email" id="hs-floating-input-email" class="peer p-3 block w-full border-4 border-gray-300 rounded-lg text-sm placeholder:text-transparent focus:outline-none focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none
    focus:pt-6 focus:pb-2 
    [&:not(:placeholder-shown)]:pt-6
    [&:not(:placeholder-shown)]:pb-2
    autofill:pt-6
    autofill:pb-2" 
	placeholder="you@email.com">

	<label for="hs-floating-input-email" class="absolute top-0 start-0 p-4 flex items-center h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 origin-[0_0] peer-disabled:opacity-50 peer-disabled:pointer-events-none
	peer-focus:scale-90
	peer-focus:translate-x-0.5
	peer-focus:-translate-y-1.5
	peer-focus:text-gray-500 
	peer-[:not(:placeholder-shown)]:scale-90
	peer-[:not(:placeholder-shown)]:translate-x-0.5
	peer-[:not(:placeholder-shown)]:-translate-y-1.5
	peer-[:not(:placeholder-shown)]:text-gray-500 text-gray-500"><iconify-icon icon={iconName} height={20} inline={true}></iconify-icon>{lable}</label>

	{#if helperText}
		<p class="mt-1 text-sm text-gray-500 dark:text-neutral-500" id="hs-input-helper-text">{helperText}</p>
	{/if}

  </div>
</div>


