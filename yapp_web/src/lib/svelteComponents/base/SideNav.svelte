<script lang="ts">
	import Dropdown from "$lib/svelteComponents/base/Dropdown.svelte";
	import ProfilePicture from "$lib/svelteComponents/display/Profile/ProfilePicture.svelte";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import Iconify from "../iconify/Iconify.svelte";
    import { signOut } from "@auth/sveltekit/client"
    import { dev } from "$app/environment";
    import { User } from "$lib/utils/auth/User";
    
    export let user: User

    let sidebarOpen = false;

    const toggleSidebar = () => {
        sidebarOpen = !sidebarOpen;
        console.log("TOGGLE SIDEBAR")
    };


    onMount(() => {
        if (!(user instanceof User)) {
            user = User.fromJSON(user);
        }
    });

</script>


    <!-- https://preline.co/examples/layouts-application.html -->
{#if user instanceof User}
    <div class="w-full h-full">
        <header class="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-30 w-full bg-white border-b border-gray-200 text-sm py-2.5 lg:ps-65">
            <nav class="px-4 sm:px-6 flex basis-full items-center w-full mx-auto">
            
                <!-- Logo Sidebar Small Screen -->
                <div class="me-5 lg:me-0 lg:hidden">
                    <a class="flex-none rounded-md text-xl inline-block font-semibold focus:outline-hidden focus:opacity-80" href="/" aria-label="Preline">
                        YAPP
                    </a>
                </div>

                <!-- Top Bar / User Icon -->
                <div class="w-full flex items-center justify-end ms-auto">
                    <div class="flex right-1 flex-row items-center justify-end gap-1">

                        {#if user instanceof User}
                            <Dropdown position={"right"}>
                                <ProfilePicture user={user} slot="default" />
                                <nav slot="content">
                                <div class="min-w-60 shadow-md rounded-lg" in:fly={{ y: 10, duration: 200 }} out:fly={{ y: 10, duration: 200 }}>
                                    <!-- Signed in as -->
                                    <div class="py-3 px-4 border-b border-gray-200">
                                    <p class="text-sm">Signed in as</p>
                                    <p class="text-sm font-medium text-primary-500">{user.getEmail()}</p>
                                    </div>
                                    <!-- Options -->
                                    <div class="p-1 space-y-0.5">
                                    <a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100" href="/settings">
                                        <Iconify iconId={"material-symbols-light:settings-outline-rounded"}/>
                                        Settings
                                    </a>
                                    <a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100" href="/settings/profile">
                                        <Iconify iconId={"material-symbols-light:person-outline-rounded"}/>
                                        Profile
                                    </a>
                                    <!-- Log out -->
                                    <button 
                                        class="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 bg-red-200 hover:bg-red-300 focus:outline-hidden focus:bg-red-300"
                                        on:click={signOut}
                                        >
                                        <Iconify iconId={"material-symbols-light:logout-rounded"}/>
                                        Log Out
                                    </button>
                                    </div>
                                </div>
                                </nav>
                            </Dropdown>
                        {/if}

                    </div>
                </div>
            </nav>
        </header>

        <!-- Nav Toggle small screens -->
        <div class="-mt-px">
            <div class="sticky top-0 inset-x-0 z-20 bg-white border-y border-gray-200 px-4 sm:px-6 lg:px-8 lg:hidden">
                <div class="flex items-center py-2">
                    <!-- Navigation Toggle -->
                    <button on:click={toggleSidebar} type="button" class="size-8 flex justify-center items-center gap-x-2 border border-gray-200 text-gray-800 hover:text-gray-500 rounded-lg focus:outline-hidden focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-application-sidebar" aria-label="Toggle navigation" data-hs-overlay="#hs-application-sidebar">
                        <span class="sr-only">Toggle Navigation</span>
                        <Iconify iconId={"material-symbols-light:menu"} button={true} />
                    </button>
                </div>
            </div>
        </div>

        <div class="flex w-full h-full">
            <!-- Sidebar -->
            <div 
                class={`fixed inset-y-0 start-0 z-30 w-64 h-full bg-white border-e border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                aria-hidden={!sidebarOpen}
            >

                <div class="relative flex flex-col h-full max-h-full">
                
                    <!-- Logo Sidebar -->
                    <div class="px-6 pt-4 flex items-center">
                        <a class="flex-none rounded-xl text-xl inline-block font-semibold focus:outline-hidden focus:opacity-80" href="/" aria-label="Preline">
                            YAPP
                        </a>

                        <!-- Close button small screen only -->
                        <button
                            on:click={toggleSidebar}
                            class="lg:hidden ml-auto mr-0 p-2 text-gray-600 hover:text-gray-900 rounded-lg"
                        >
                            <Iconify iconId="material-symbols-light:close-rounded" button={true}/>
                        </button>

                    </div>

                    <!-- Content -->
                    <div class="h-full overflow-y-auto">
                        <nav class="p-3 w-full flex flex-col flex-wrap">
                            <ul class="flex flex-col space-y-1 w-full">
                        
                                <!-- Admin/Mod Links -->
                                {#if user.getRole("admin") || user.getRole("moderator")}

                                    <!-- Dashboard -->
                                    <li>
                                        <a class="w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100" href="/settings/dashboard">
                                            <Iconify iconId={"material-symbols-light:house-outline-rounded"}/>
                                            Dashboard
                                        </a>
                                    </li>

                                    <!-- Page Editor -->
                                    <li>
                                        <a class="w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100" href="/settings/pageeditor">
                                            <Iconify iconId={"material-symbols-light:edit-outline-rounded"}/>
                                            Homepage
                                        </a>
                                    </li>


                                    <!-- Blog Editor -->
                                    <li>
                                        <a class="w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100" href="/settings/blogeditor">
                                            <Iconify iconId={"material-symbols-light:docs-outline-rounded"}/>
                                            Blogs
                                        </a>
                                    </li>


                                    <!-- Calendar -->
                                    <li>
                                        <a class="w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100" href="/settings/images">
                                            <Iconify iconId={"material-symbols-light:image-search-outline-rounded"}/>
                                            Images
                                        </a>
                                    </li>
                                {/if}

                                <!-- Profile -->
                                <li>
                                    <a class="w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100" href="/settings/profile">
                                        <Iconify iconId={"material-symbols-light:person-outline-rounded"}/>
                                        Profile
                                    </a>
                                </li>

                                <!-- About -->
                                <li>
                                    <a class="w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100" href="/settings/about">
                                        <Iconify iconId={"material-symbols-light:info-outline-rounded"}/>
                                        About
                                    </a>
                                </li>


                                <!-- Docs -->
                                <li>
                                    <a class="w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100" href="/docs/settings">
                                        <Iconify iconId={"material-symbols-light:docs-outline-rounded"}/>
                                        Documentation
                                    </a>
                                </li>                                
                            </ul>
                        </nav>
                    </div>
                    <!-- End Content -->
                </div>
            </div>


            <!-- Content -->
            <div class="w-full p-8">
                <slot />
            </div>
        </div>

    </div>

    <!-- Dark overlay small screen -->
    {#if sidebarOpen}
        <button
            type="button"
            class="fixed inset-0 bg-black/40 z-30 lg:hidden appearance-none cursor-default"
            on:click={toggleSidebar}
            aria-label="Close sidebar overlay"
            transition:fade
        />
    {/if}

{/if}