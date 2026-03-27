<script lang="ts">
    import { page } from '$app/stores';
  import Iconify from '$lib/svelteComponents/iconify/Iconify.svelte';
</script>

<div class="w-full h-full flex flex-col m-auto size-full">
    <main id="content">
        <div class="text-center py-10 px-4 sm:px-6 lg:px-8">
            <h1 class="block text-7xl! font-bold! sm:text-9xl!">
                {$page.status}
            </h1>

            <p class="mt-3 text-muted-foreground-2">
                Oops, something went wrong.
            </p>

            <p class="text-muted-foreground-2">
                {$page.error?.message || 'Something went wrong.'}
            </p>

            <div class="mt-5 flex flex-col justify-center items-center gap-2 sm:flex-row sm:gap-3">
                <a class="defaultButton w-full sm:w-auto py-3 px-4 inline-flex justify-center items-center" href="/">
                    <Iconify iconId={"material-symbols-light:arrow-back-ios-new-rounded"} style={"color: white"} />
                    Go back home
                </a>
            </div>
        </div>
    </main>
</div>