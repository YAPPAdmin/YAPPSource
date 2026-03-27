<script lang="ts">
  import BlogPost from "$lib/svelteComponents/blog/BlogPostViewer.svelte";


</script>

<div>
    <p>Blog Overview</p>

    <!-- Card Blog -->
    <div class="max-w-340 px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Grid -->
    <div class="grid sm:grid-cols-2 sm:items-center gap-8">
        <div class="sm:order-2">
        <div class="relative pt-[50%] sm:pt-[100%] rounded-lg">
            <img class="size-full absolute top-0 start-0 object-cover rounded-lg" src="https://images.unsplash.com/photo-1606868306217-dbf5046868d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80" alt="Blog Image">
        </div>
        </div>
        <!-- End Col -->

        <div class="sm:order-1">
        <p class="mb-5 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium bg-surface text-surface-foreground">
            Business insight
        </p>

        <h2 class="text-2xl font-bold md:text-3xl lg:text-4xl lg:leading-tight xl:text-5xl xl:leading-tight text-foreground">
            <a class="hover:text-primary focus:outline-hidden focus:text-primary" href="#">
            How to get buy-in and budget for direct hiring
            </a>
        </h2>

        <!-- Avatar -->
        <div class="mt-6 sm:mt-10 flex items-center">
            <div class="shrink-0">
            <img class="size-10 sm:h-14 sm:w-14 rounded-full" src="https://images.unsplash.com/photo-1669837401587-f9a4cfe3126e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80" alt="Blog Image">
            </div>

            <div class="ms-3 sm:ms-4">
            <p class="sm:mb-1 font-semibold text-foreground">
                Louise Donadieu
            </p>
            <p class="text-xs text-muted-foreground-1">
                Strategic Marketing Consultant
            </p>
            </div>
        </div>
        <!-- End Avatar -->

        <div class="mt-5">
            <a class="inline-flex items-center gap-x-1.5 text-primary decoration-2 hover:underline focus:outline-hidden focus:underline font-medium" href="#">
            Read more
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </a>
        </div>
        </div>
        <!-- End Col -->
    </div>
    <!-- End Grid -->
    </div>
    <!-- End Card Blog -->

    <!-- Card Blog -->
    <div class="max-w-340 px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Title -->
    <div class="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
        <h2 class="text-2xl font-bold md:text-4xl md:leading-tight text-foreground">Insights</h2>
        <p class="mt-1 text-muted-foreground-2">Stay in the know with insights from industry experts.</p>
    </div>
    <!-- End Title -->

    <!-- Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Card -->
        <a class="group flex flex-col focus:outline-hidden" href="#">
        <div class="relative pt-[50%] sm:pt-[70%] rounded-xl overflow-hidden">
            <img class="size-full absolute top-0 start-0 object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out rounded-xl" src="https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80" alt="Blog Image">
            <span class="absolute top-0 end-0 rounded-se-xl rounded-es-xl text-xs font-medium bg-secondary text-secondary-foreground py-1.5 px-3">
            Sponsored
            </span>
        </div>

        <div class="mt-7">
            <h3 class="text-xl font-semibold text-foreground group-hover:text-muted-foreground-2">
            Studio by Preline
            </h3>
            <p class="mt-3 text-foreground">
            Produce professional, reliable streams easily leveraging Preline's innovative broadcast studio
            </p>
            <p class="mt-5 inline-flex items-center gap-x-1 text-sm text-primary decoration-2 group-hover:underline group-focus:underline font-medium">
            Read more
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </p>
        </div>
        </a>
        <!-- End Card -->

        <!-- Card -->
        <a class="group flex flex-col focus:outline-hidden" href="#">
        <div class="relative pt-[50%] sm:pt-[70%] rounded-xl overflow-hidden">
            <img class="size-full absolute top-0 start-0 object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out rounded-xl" src="https://images.unsplash.com/photo-1542125387-c71274d94f0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80" alt="Blog Image">
        </div>

        <div class="mt-7">
            <h3 class="text-xl font-semibold text-foreground group-hover:text-muted-foreground-2">
            Onsite
            </h3>
            <p class="mt-3 text-foreground">
            Optimize your in-person experience with best-in-class capabilities like badge printing and lead retrieval
            </p>
            <p class="mt-5 inline-flex items-center gap-x-1 text-sm text-primary decoration-2 group-hover:underline group-focus:underline font-medium">
            Read more
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </p>
        </div>
        </a>
        <!-- End Card -->

        <!-- Card -->
        <a class="group relative flex flex-col w-full min-h-60 bg-[url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80')] bg-center bg-cover rounded-xl hover:shadow-lg focus:outline-hidden focus:shadow-lg transition" href="#">
        <div class="flex-auto p-4 md:p-6">
            <h3 class="text-xl text-white/90 group-hover:text-white"><span class="font-bold">Preline</span> Press publishes books about economic and technological advancement.</h3>
        </div>
        <div class="pt-0 p-4 md:p-6">
            <div class="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-white/70 group-focus:text-white/70">
            Visit the site
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
        </div>
        </a>
        <!-- End Card -->
    </div>
    <!-- End Grid -->
    </div>
    <!-- End Card Blog -->

    <!-- Card Blog -->
    <div class="max-w-340 px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Grid -->
    <div class="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
        <!-- Card -->
        <a class="group block rounded-xl overflow-hidden focus:outline-hidden" href="#">
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div class="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44">
            <img class="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl" src="https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&q=80" alt="Blog Image">
            </div>

            <div class="grow">
            <h3 class="text-xl font-semibold text-foreground group-hover:text-muted-foreground-2">
                Studio by Preline
            </h3>
            <p class="mt-3 text-muted-foreground-2">
                Produce professional, reliable streams easily leveraging Preline's innovative broadcast studio
            </p>
            <p class="mt-4 inline-flex items-center gap-x-1 text-sm text-primary decoration-2 group-hover:underline group-focus:underline font-mediumtext-primary decoration-2 group-hover:underline group-focus:underline font-medium">
                Read more
                <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </p>
            </div>
        </div>
        </a>
        <!-- End Card -->

        <!-- Card -->
        <a class="group block rounded-xl overflow-hidden focus:outline-hidden" href="#">
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div class="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44">
            <img class="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl" src="https://images.unsplash.com/photo-1668906093328-99601a1aa584?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&q=80" alt="Blog Image">
            </div>

            <div class="grow">
            <h3 class="text-xl font-semibold text-foreground group-hover:text-muted-foreground-2">
                Onsite
            </h3>
            <p class="mt-3 text-muted-foreground-2">
                Optimize your in-person experience with best-in-class capabilities like badge printing and lead retrieval
            </p>
            <p class="mt-4 inline-flex items-center gap-x-1 text-sm text-primary decoration-2 group-hover:underline group-focus:underline font-mediumtext-primary decoration-2 group-hover:underline group-focus:underline font-medium">
                Read more
                <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </p>
            </div>
        </div>
        </a>
        <!-- End Card -->

        <!-- Card -->
        <a class="group block rounded-xl overflow-hidden focus:outline-hidden" href="#">
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div class="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44">
            <img class="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl" src="https://images.unsplash.com/photo-1567016526105-22da7c13161a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&q=80" alt="Blog Image">
            </div>

            <div class="grow">
            <h3 class="text-xl font-semibold text-foreground group-hover:text-muted-foreground-2">
                The complete guide to OKRs
            </h3>
            <p class="mt-3 text-muted-foreground-2">
                How to make objectives and key results work for your company
            </p>
            <p class="mt-4 inline-flex items-center gap-x-1 text-sm text-primary decoration-2 group-hover:underline group-focus:underline font-mediumtext-primary decoration-2 group-hover:underline group-focus:underline font-medium">
                Read more
                <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </p>
            </div>
        </div>
        </a>
        <!-- End Card -->

        <!-- Card -->
        <a class="group block rounded-xl overflow-hidden focus:outline-hidden" href="#">
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div class="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44">
            <img class="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&q=80" alt="Blog Image">
            </div>

            <div class="grow">
            <h3 class="text-xl font-semibold text-foreground group-hover:text-muted-foreground-2">
                People program models
            </h3>
            <p class="mt-3 text-muted-foreground-2">
                Six approaches to bringing your People strategy to life
            </p>
            <p class="mt-4 inline-flex items-center gap-x-1 text-sm text-primary decoration-2 group-hover:underline group-focus:underline font-mediumtext-primary decoration-2 group-hover:underline group-focus:underline font-medium">
                Read more
                <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </p>
            </div>
        </div>
        </a>
        <!-- End Card -->
    </div>
    <!-- End Grid -->
    </div>
    <!-- End Card Blog -->

</div>