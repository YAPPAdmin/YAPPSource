<!-- https://svelte.dev/examples/modal -->

<script lang="ts">
	import { createEventDispatcher } from "svelte";
    import  { Integration } from "$lib/classes"
	import PrivatTextInput from "$lib/helperComponents/PrivatTextInput.svelte";
	import SettingsBlock from "$lib/helperComponents/SettingsBlock.svelte";
  import IntegrationCard from "../integrations/IntegrationCard.svelte";
	
	// @ts-nocheck
    
    export let integration: Integration;
	const integrationInitialState: Integration = integration;
	export let showModal = false;
    export let closeButtonText: string;
	
	let test = true;

	const dispatch = createEventDispatcher();

	let dialog; 
	$: if (dialog && showModal) dialog.showModal();

	async function saveAndClose() {
        console.log("Save and Close")
		dispatch("save", integration);
		showModal = false
		await saveToDB();
		dialog.close();
	}

	async function save() {
        console.log("Save")
		await saveToDB();
		dispatch("save", integration);
	}

    function closeWithoutSave() {
        console.log("Close without save")
		dialog.close();
    }

	async function saveToDB() {
		console.log("SAVING CHANGES TO: ", integration.name);

	}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
    class="rounded-xl border-8 p-3 w-2/3 min-w-fit shadow-md"
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
        <h2>
            {#if integration.icon}
                <iconify-icon icon="{integration.icon}" height={16}></iconify-icon>
            {/if}
            {integration.name}
			<div class="float-right">
				{#if integration.active}
					<p class="uppercase text-teal-500">
						Active
					</p>
				{:else if integration.active == false}
					<p class="uppercase text-red-600">
						Deactivated
					</p>
				{:else}
					<p class="uppercase text-red-600">
						Unknown
					</p>
				{/if}
			</div>
        </h2>
        <hr />

		<!-- Settings -->
		<div>



			<SettingsBlock settingsName={"Status"}>
				<div slot="setting">
					<input bind:checked={integration.active} type="checkbox" class="relative w-[3.25rem] h-7 p-px bg-gray-400 border-transparent text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue-600 checked:border-blue-600 focus:checked:border-blue-600 before:inline-block before:size-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 ">
				</div>
			</SettingsBlock>

			<SettingsBlock settingsName={"API Key"}>
				<div slot="setting">
					<PrivatTextInput bind:value={integration.apiKey} placeholder="{integration.name} API Key"></PrivatTextInput>
				</div>
			</SettingsBlock>

		

		<!-- svelte-ignore a11y-autofocus -->
		<div class="flex"> 
			<button on:click={() => closeWithoutSave()} autofocus type="button" class="alertButton">
				{closeButtonText}
			</button>

			<button on:click={save} type="button" class="defaultButton mr-0 ml-auto">
				Save
			</button>

			<button on:click={saveAndClose} type="button" class="defaultButton mr-0 ml-3">
				Save and Close
			</button>
		</div>
    </div>
</dialog>

<style>

	.option {
		@apply
		flex items-center relative
		mb-6
		;
	}




	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}

	dialog > div {
		padding: 1em;
	}

	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}

	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

</style>
