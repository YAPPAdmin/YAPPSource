<!-- https://svelte.dev/examples/modal -->

<script>
	import { createEventDispatcher } from "svelte";
	
	
	// @ts-nocheck
	export let showModal;
    export let closeButtonText;

	const dispatch = createEventDispatcher();

	let dialog; 
	$: if (dialog && showModal) dialog.showModal();


	function saveAndClose() {
		dispatch("save");
		showModal = false
		dialog.close();
	}

	function save() {
		dispatch("save");
	}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
    class="rounded-xl border-8 p- w-2/3"
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<slot name="header" />
		<hr />
		<slot name="content" class="my-5"/>
		<hr />
		<!-- svelte-ignore a11y-autofocus -->

        <button on:click={() => dialog.close()} autofocus type="button" class="alertButton">
            {closeButtonText}
        </button>

		<button on:click={save} type="button" class="defaultButton float-right mx-2">
			Save
		</button>

		<button on:click={saveAndClose} type="button" class="defaultButton float-right mx-2">
			Save and Close
		</button>

		<!-- <button  on:click={() => dialog.close()}>close</button> -->
	</div>
</dialog>

<style>
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
