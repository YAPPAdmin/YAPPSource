<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
	import { messageStore } from "$lib/utils/userMessages";
	import { fade } from "svelte/transition";

</script>


<!-- https://preline.co/examples/cookie-banners.html -->
<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-[80%] sm:max-w-[30%]">
	{#each $messageStore as msg (msg.id)}

		<div 
			class={` px-4 py-3 text-sm p-4 rounded-xl shadow-2xl z-15
				${msg.type === "success" ? "!bg-success-light !text-success-default" : ""}
				${msg.type === "warning" ? "!bg-warning-light !text-warning-default" : ""}
				${msg.type === "error" ? "!bg-error-light !text-error-default" : ""}
				${msg.type === "info" ? "!bg-primary-900 !text-primary-500" : ""}

			`}

			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
		>

			<button
				class="absolute top-3 right-3 text-xl leading-none text-gray-500 hover:text-gray-800"
				aria-label="Close"
				on:click={() => messageStore.remove(msg.id)}
			>
				<Iconify iconId={"material-symbols-light:close-small-outline-rounded"} button={true}/>
			</button>

			<div class="flex gap-x-5">

				{#if msg.component}
					<svelte:component this={msg.component} {...(msg.props || {})} />
				{:else if msg.text}
					{msg.text}
				{/if}

			</div>
		</div>
	{/each}
</div>