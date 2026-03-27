<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade, fly } from "svelte/transition";
	import Iconify from "../iconify/Iconify.svelte";
	import { User } from "$lib/utils/auth/User";
	import ProfilePicture from "../display/Profile/ProfilePicture.svelte";
	import Dropdown from "./Dropdown.svelte";
	import { signOut } from "@auth/sveltekit/client"
    

	export let user: User;

	let isMenuOpen = false;
	let responsivePosition: "left" | "right" | "centered" = "centered";

	const toggleMenu = () => {
		isMenuOpen = !isMenuOpen;
	};

	const updatePosition = () => {
		if (typeof window !== "undefined") {
			responsivePosition = window.matchMedia("(min-width: 768px)").matches ? "right" : "left";
		}
	};

	onMount(() => {
		updatePosition();
		if (typeof window !== "undefined") {
			window.addEventListener("resize", updatePosition);
		}

		return () => {
			if (typeof window !== "undefined") {
			window.removeEventListener("resize", updatePosition);
			}
		};
	});
</script>

<nav class="relative max-w-[85rem] w-full mx-auto md:flex md:items-center md:justify-between md:gap-3 py-2 px-4 sm:px-6 lg:px-8">
  <!-- Brand and Collapse Button -->
  <div class="flex justify-between items-center gap-x-1">
    <img src={"/yapp_logo_text.webp"} alt="YAPP Logo" class="h-8"/>

    <!-- Toggle Button -->
    <button
      type="button"
      on:click={toggleMenu}
      class="md:hidden relative size-9 flex justify-center items-center font-medium text-sm rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
    >
      <svg
        class="{isMenuOpen ? "hidden" : "block"} size-4"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="3" x2="21" y1="6" y2="6"/>
        <line x1="3" x2="21" y1="12" y2="12"/>
        <line x1="3" x2="21" y1="18" y2="18"/>
      </svg>
      <svg
        class="{isMenuOpen ? "block" : "hidden"} shrink-0 size-4"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
      </svg>
      <span class="sr-only">Toggle navigation</span>
    </button>
  </div>

  <!-- Collapse with Animation -->
  <div
    in:fly={{ y: -20, duration: 300 }}
    out:fly={{ y: -20, duration: 300 }}
    class="{isMenuOpen ? "block" : "hidden"} transition-all duration-300 basis-full grow md:block"
  >
    <div class="py-2 md:py-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
      <!-- Main Links and Profile -->
      <div class="flex flex-col grow md:flex-row md:justify-end md:items-center gap-0.5 md:gap-1">
        <a class="p-2 flex items-center text-sm bg-gray-100 text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100" href="/">
			<svg class="shrink-0 size-4 me-3 md:me-2 block md:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
			Landing
        </a>
        <a class="p-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100" href="/">
          <svg class="shrink-0 size-4 me-3 md:me-2 block md:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Account
        </a>
        <a class="p-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100" href="/shop">
          <svg class="shrink-0 size-4 me-3 md:me-2 block md:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
          Shop
        </a>
        <a class="p-2 flex items-center text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100" href="/blog">
          <svg class="shrink-0 size-4 me-3 md:me-2 block md:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
          Blog
        </a>
      </div>
      <!-- Divider -->
      <div class="my-2 md:my-0 md:mx-2">
        <div class="w-full h-px md:w-px md:h-4 bg-gray-100 md:bg-gray-300"></div>
      </div>
      <!-- Profile -->
      <div class="flex flex-wrap items-center gap-x-1.5">
        {#if !(user instanceof User)}
          <!-- Sign in Area -->
          <div class="flex flex-wrap items-center gap-x-1.5">
            <a class="py-[7px] px-2.5 inline-flex items-center font-medium text-sm rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-100" href="/signin">
              Sign in
            </a>
            <a class="py-2 px-2.5 inline-flex items-center font-medium text-sm rounded-lg bg-primary-500 text-white hover:bg-primary-600 focus:outline-hidden focus:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none" href="/signup">
              Get started
            </a>
          </div>
        {:else}
          <Dropdown position={responsivePosition}>
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
  </div>
  <!-- End Collapse -->
</nav>

<!-- Page Content Stuff? -->
<nav class="hidden bg-white shadow-2xl shadow-gray-200">
  <div class="max-w-[85rem] w-full mx-auto sm:flex sm:flex-row sm:justify-between sm:items-center sm:gap-x-3 py-3 px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center gap-x-3">
      <div class="grow">
        <span class="font-semibold whitespace-nowrap text-gray-800">My project</span>
      </div>
      <button type="button" class="hs-collapse-toggle sm:hidden py-1.5 px-2 inline-flex items-center font-medium text-xs rounded-md border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
        Overview
        <svg class="hs-dropdown-open:rotate-180 shrink-0 size-4 ms-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
  </div>
</nav>
