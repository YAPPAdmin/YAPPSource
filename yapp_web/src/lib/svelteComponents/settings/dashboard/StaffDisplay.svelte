<script lang="ts">
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";
    import { User } from "$lib/utils/auth/User";
    import { formatDate } from "$lib/utils/util";


    export let users: any = []
    export let user: any

</script>

<div class=" w-full flex flex-col">
    <div class="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
        <div class="min-w-full inline-block align-middle">
        
            <div class="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
                <!-- Header -->
                <div class="px-6 py-4 gap-3 flex items-center justify-between border-b border-gray-200">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-800">
                            Users
                        </h2>

                        <p class="text-sm text-gray-600">
                            Add users, edit and more.
                        </p>
                    </div>

                    <button class="defaultButton !mt-0">
                        <Iconify iconId={"material-symbols-light:person-add-outline-rounded"} style={"color: white"} />
                        Add user
                    </button>

                </div>

                <!-- Table -->
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="ps-6 py-3 text-start">
                                <div class="flex items-center gap-x-2">
                                    <span class="text-xs font-semibold uppercase text-gray-800">
                                        Name
                                    </span>
                                </div>
                            </th>

                            <th scope="col" class="px-6 py-3 text-start">
                                <div class="flex items-center gap-x-2">
                                    <span class="text-xs font-semibold uppercase text-gray-800">
                                        Role
                                    </span>
                                </div>
                            </th>

                            <th scope="col" class="px-6 py-3 text-start">
                                <div class="flex items-center gap-x-2">
                                    <span class="text-xs font-semibold uppercase text-gray-800">
                                        E-Mail
                                    </span>
                                </div>
                            </th>

                            <th scope="col" class="px-6 py-3 text-start">
                                <div class="flex items-center gap-x-2">
                                    <span class="text-xs font-semibold uppercase text-gray-800">
                                        Created
                                    </span>
                                </div>
                            </th>

                            <th scope="col" class="px-6 py-3 text-end"></th>
                            </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-200">
                        {#if users.adminUsers}
                            {#each users.adminUsers as user}
                                <tr class="hover:bg-gray-100">
                                    
                                    <!-- Name -->
                                    <td class="size-px whitespace-nowrap">
                                        <div class="ps-6 py-3">
                                            <div class="flex items-center space-x-5">
                                                <img class="inline-block size-9.5 rounded-full" src="https://images.unsplash.com/photo-1531927557220-a9e23c1e4794?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80" alt="Avatar">
                                                <div class="grow">
                                                    {#if user.firstname && user.lastname}
                                                        <span class="block text-sm font-semibold text-gray-800">{user.firstname} {user.lastname}</span>
                                                        <span class="block text-sm text-gray-500">{user.username}</span>
                                                    {:else}
                                                        <span class="block text-sm font-semibold text-gray-800">{user.username}</span>
                                                    {/if}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <!-- Role -->
                                    <td class="h-px w-72 whitespace-nowrap">
                                        <div class="px-6 py-3">
                                            <p class="block text-sm font-semibold text-gray-800 uppercase">{user.role}</p>
                                        </div>
                                    </td>

                                    <!-- Email -->
                                    <td class="h-px w-72 whitespace-nowrap">
                                        <div class="px-6 py-3">
                                            <p class="block text-sm font-semibold text-gray-800">{user.email}</p>
                                        </div>
                                    </td>
                                
                                    <!-- Created -->
                                    <td class="size-px whitespace-nowrap">
                                        <div class="px-6 py-3">
                                            <span class="text-sm text-gray-500">{formatDate(user.emailVerified)}</span>
                                        </div>
                                    </td>

                                    <!-- Edit -->
                                    <td class="size-px whitespace-nowrap">
                                        <div class="px-6 py-1.5">
                                        <a class="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium" href="#">
                                            Edit
                                        </a>
                                        </div>
                                    </td>

                                </tr>
                            {/each}
                        {/if}



                        {#if !users.modUsers}
                            {#each users.modUsers as user}
                                <tr>
                                    <!-- Checkbox -->
                                    <td class="size-px whitespace-nowrap">
                                        <div class="ps-6 py-3">
                                            <label for="hs-at-with-checkboxes-1" class="flex">
                                                <input type="checkbox" class="shrink-0 border-gray-300 rounded-sm text-blue-600 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none" id="hs-at-with-checkboxes-1">
                                                <span class="sr-only">Checkbox</span>
                                            </label>
                                        </div>
                                    </td>

                                    <!-- Name -->
                                    <td class="size-px whitespace-nowrap">
                                        <div class="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3">
                                            <div class="flex items-center gap-x-3">
                                                <img class="inline-block size-9.5 rounded-full" src="https://images.unsplash.com/photo-1531927557220-a9e23c1e4794?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80" alt="Avatar">
                                                <div class="grow">
                                                    {#if user.firstname && user.lastname}
                                                        <span class="block text-sm font-semibold text-gray-800">{user.firstname} {user.lastname}</span>
                                                        <span class="block text-sm text-gray-500">{user.username}</span>
                                                    {:else}
                                                        <span class="block text-sm font-semibold text-gray-800">{user.username}</span>
                                                    {/if}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <!-- Email -->
                                    <td class="h-px w-72 whitespace-nowrap">
                                        <div class="px-6 py-3">
                                            <p class="block text-sm font-semibold text-gray-800">{user.email}</p>
                                        </div>
                                    </td>
                                
                                    <!-- Created -->
                                    <td class="size-px whitespace-nowrap">
                                        <div class="px-6 py-3">
                                            <span class="text-sm text-gray-500">{formatDate(user.emailVerified)}</span>
                                        </div>
                                    </td>

                                    <!-- Edit -->
                                    <td class="size-px whitespace-nowrap">
                                        <div class="px-6 py-1.5">
                                        <a class="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium" href="#">
                                            Edit
                                        </a>
                                        </div>
                                    </td>

                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
                <!-- <p>{user.email}</p> -->
            </div>
        </div>
    </div>
</div>
<!-- End Card -->

