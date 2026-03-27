<script lang="ts">
    import { User } from "$lib/utils/auth/User";
    import { onMount } from "svelte";

    export let user: User;

    export let size: string = "size-10"

    onMount(() => {
        if (!(user instanceof User)) {
            user = User.fromJSON(user);
        }
    });

</script>


<div class={size}>
    <span class="w-full h-full inline-flex items-center justify-center size-10 text-sm font-semibold rounded-full border border-primary-500 text-primary-500 shadow-2xl hover:shadow-2xl">
        {#if user instanceof User}
            {#if user.getImage()}
                <!-- User Image -->
                <img class="inline-block rounded-full" src={user.getImage()} alt="Avatar">
            {:else}
                <!-- User Initials -->
                {user.getInitials()}
            {/if}
 
        <!-- Loading Skelton while no user -->
        {:else}
            <div class="shrink-0">
                <span class="animate-pulse size-12 block bg-gray-200 rounded-full"></span>
            </div>
        {/if}
        
    </span>
</div>