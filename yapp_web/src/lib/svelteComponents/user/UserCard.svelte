<script lang="ts">
    import { generateInitials } from "$lib/utils/util";
    
    export let user;

	$: initials = generateInitials(user?.name);
</script>

<div class="w-96 p-4 md:p-5 flex flex-col bg-white border border-secondary-800 shadow-2xs rounded-xl">
    
    <div class="flex items-center">
        <h3 class="text-lg font-bold text-gray-800">
            {user.name}
        </h3>

        <div class="flex-1 flex justify-end">
            {#if user.image}
                <img
                    class="inline-block size-10 rounded-full cursor-pointer"
                    src={user.image}
                    alt="Profile"
                />
            {:else}
                <span class="inline-flex size-10 items-center justify-center rounded-full bg-highlight-500 text-2xl font-semibold text-white cursor-pointer">{initials}</span>
            {/if}
        </div>
    </div>

    <p class="mt-0 !text-secondary-800 ">
        {user.email}
    </p>

</div>