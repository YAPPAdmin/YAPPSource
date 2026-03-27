<script lang="ts">
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { onMount } from "svelte";
    import ProfilePicture from "../ProfilePicture.svelte";

    export let authorId: string = "";

    let author: any = null;
    let isLoading = true;
    let hasError = false;

    $: if (authorId) {
        fetchProfile(authorId);
    }

    async function fetchProfile(authorId: string) {
        isLoading = true;
        hasError = false;

        try {
            const result = await fetch(`/api/user?userId=${authorId}`);    

            if(result.ok) {
                const data = await result.json();
                console.log("RESULT: ", data)

                if(data.users && data.users.length > 0) {
                    author = data.users[0];
                } else {
                    hasError = true;
                }
            } else {
                hasError = true;
            }
        } catch(error) {
            console.error("Failed to fetch author: ", error);
            hasError = true;
        } finally {
            isLoading = false;
        }
    }

    $: displayName = author?.firstname && author?.lastname 
        ? `${author.firstname} ${author.lastname}` 
        : author?.username || "Unknown Author";

    onMount(() => {
        fetchProfile(authorId)
    })

</script>

<div class="w-full ">
    {#if isLoading} 
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 animate-pulse border border-gray-100">
            <div class="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
            <div class="flex flex-col gap-2 grow">
                <div class="h-4 bg-gray-200 rounded-md w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded-md w-1/2"></div>
            </div>
        </div>
    {:else if hasError || !author}
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-error-light border border-error-default">
            <Iconify iconId="material-symbols-light:account-circle-off-outline-rounded" height={32} style={"color: error-default"}/>
            <p class="text-sm! font-medium1 text-error-default!">Author Profile Unavailable</p>
        </div>
    {:else}
        <div class="flex items-center gap-4 p-4 rounded-2xl shadow-xl">
            <div class="w-12 h-12 rounded-fullshrink-0">
                <ProfilePicture user={author} size="w-full h-full"/>
            </div>
            
            <div class="flex flex-col gap-2 grow">
                <div class="rounded-md w-3/4 p-1">
                    <p class="text-primary-500! font-semibold!">{displayName}</p>
                </div>

                <div class="rounded-md w-1/2">
                    {#if author.pronouns}
                        <p>{author.pronouns}</p>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>