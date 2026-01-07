<script lang="ts" context="module">

    export type Contact1Schema = {
        title: string,
        addresses: {}[],
        phoneNumbers: {}[],
        email: {}[],
        image: {},
    }

    export const Contact1SchemaDefinition = {
        title: {
            type: "string",
            label: "Title",
            description: "Title",
            input: "text",
            default: "Contact",
        },
        addresses: {
            type: "array",
            label: "Addresses",
            description: "All your public addresses",
            itemSchema: {
                type: "object",
                schema: {
                    main: {type: "boolean", label: "(Regional) Headquarters", description: "Main (Regional) Headquarters", default: false},
                    name: {type: "string", label: "Address Name", description: "Address Name", default: "Office"},
                    country: {type: "string", label: "Country", description: "Country", default: "Austria"},
                    state: {type: "string", label: "State/Province", description: "State/Province", default: "Carinthia"},
                    street1: {type: "string", label: "Street 1", description: "Street 1", default: "Kirchenplatz 12"},
                    street2: {type: "string", label: "Street 2", description: "Street 2", default: ""},
                    postalCode: {type: "number", label: "Postal Code", description: "Postal Code", default: 9500},
                    city: {type: "string", label: "City", description: "City", default: "Villach"}
                }
            }
        },
        phoneNumbers: {
            type: "array",
            label: "Phone Numbers",
            description: "Your Phone Number(s)",
            itemSchema: {
                type: "object",
                schema: {
                    label: {type: "string", label: "Label", description: "Phone Number Label", default: "Call Us!"},
                    type: {type: "select", label: "Type", description: "Type", options: ["mobile", "landline", "fax", "None"], default: "None"},
                    phoneNumber: {type: "string", label: "Phone Number", description: "Phone Number", default: "+43 123 4567890"},
                }
            }
        },
        email: {
            type: "email",
            label: "Emails",
            description: "Your Email Addresses",
            itemSchema: {
                type: "object",
                schema: {
                    label: {type: "string", label: "Label", description: "Email Label", default: "Email Us!"},
                    email: {type: "string", label: "Email", description: "Email", default: "test@placeholder.com"},
                }
            }
        },
        image: {
            type: "object",
            label: "Image", 
            description: "Contact Image",
            itemSchema: {
                name: {type: "string", label: "Image Alt Name", description: "Alternative Name", default: ""},
                image: {type: "string", label: "Image URL", description: "Image URL", default: "https://picsum.photos/1080/1080"}
            }
        }
    }

    export const Contact1DefaultSchema: Contact1Schema = {
        title: "Contact",
        addresses: [
            {
                main: true,
                name: "Office",
                country: "Austria",
                state: "Carinthia",
                street1: "Kirchenplatz 12",
                street2: "",
                postalCode: 9500,
                city: "Villach"
            },
        ],
        phoneNumbers: [
            {
                label: "Call Us!",
                type: "mobile",
                phoneNumber: "+43 123 4567890",
            }
        ],
        email: [
            {
                label: "Email Us!",
                email: "test@placeholder.com"
            }
        ],
        image: {
            name: "Contact Image",
            image: "https://picsum.photos/1080/1080",
        }
    };

</script>

<script lang="ts">
    import { dev } from "$app/environment";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";

    export let componentContent;
    console.log(componentContent)

</script>


<div class="max-w-7xl sm:px-6 p-4 mx-auto">
    <div class="my-2 max-w-2xl text-center mx-auto">
        <Tooltip text={"Titel"} condition={dev}>
            <h2 class="font-medium text-black text-2xl sm:text-4xl">
                {componentContent.title || "Contacts"}
            </h2>
        </Tooltip>

    </div>

    <!-- Information -->
    <div class="w-full flex lg:grid-cols-2 lg:items-center gap-6 md:gap-8 lg:gap-12">
        
        <!-- Image -->
        {#if componentContent.image}
            <div class="aspect-w-16 max-w-1/2 aspect-h-6 lg:aspect-h-14 overflow-hidden bg-gray-100 rounded-2xl">

                <Tooltip text={componentContent?.image?.name}>
                    <img 
                        class="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out object-cover rounded-2xl" 
                        src={componentContent?.image?.image || "https://picsum.photos/1080/1080"}
                        alt={componentContent?.image?.name || "Contact image"}>
                </Tooltip>
            </div>
        {/if}

        <!-- Contact Info -->
        <div class="space-y-8 max-w-1/2 lg:space-y-16">
            <div>
                {#if componentContent.addresses && componentContent.addresses.length > 0}
                    <h3 class="mb-5 font-semibold text-black">
                        Our address
                    </h3>

                    <div class="justify-between w-full grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
                        {#each componentContent.addresses as address }
                            <address class="items-start text-left">
                                {#if address.name} <h3>{address.name}</h3> {/if}

                                <div class="mt-2">
                                    <div class="flex flex-row items-center">
                                        <Iconify iconId={"material-symbols-light:location-on-outline-rounded"} /> 
                                        {#if address.country}
                                            <p class="!text-pimary-500 text-sm ">{address.country}</p>
                                        {/if}
                                    </div>

                                    <div class="pl-1.5">
                                        {#if address.street2}
                                            <p>{address.street2}</p>
                                        {/if}

                                        {#if address.street1}
                                            <p>{address.street1}</p>
                                        {/if}

                                        <div>
                                            {#if address.postalCode} {address.postalCode} {/if}
                                            {#if address.city} {address.city} {/if}
                                        </div>

                                        <div>
                                            {#if address.state} {address.state} {/if}
                                            {#if address.state && address.country} - {/if}
                                            {#if address.country} {address.country} {/if}
                                        </div>
                                    </div>
                                </div>
                            </address>  
                        {/each}
                    </div>
                {/if}
            </div>

            <div>
                {#if (componentContent.email && componentContent.email.length > 0) || (componentContent.phoneNumbers && componentContent.phoneNumbers.length > 0)}
                    <h3 class="mb-5 font-semibold text-black">
                        Our contacts
                    </h3>

                   <div class="justify-between mt-2 w-full grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
                        {#each componentContent.email as email}
                            <div class="flex flex-col">
                                <div class="flex flex-row">
                                    <Iconify iconId={"material-symbols-light:mail-outline-rounded"} />
                                    <p class="text-sm text-gray-600">
                                        {email.name || "Email"}   
                                    </p>
                                </div>

                                <div>
                                    {#if email.email}    
                                        <a 
                                            class="relative inline-block font-medium text-black before:absolute before:bottom-0.5 before:start-0 before:-z-1 before:w-full before:h-1 before:bg-tertiary-400 hover:before:bg-black focus:outline-hidden focus:before:bg-black" 
                                            href={`mailto:${email.email}`}
                                        >
                                            {email.email}
                                        </a>
                                    {/if}
                                </div>
                            </div>
                        {/each}

                        {#each componentContent.phoneNumbers as phone}
                            <div class="flex flex-col">
                                <div class="flex flex-row">
                                    <Iconify iconId={"material-symbols-light:mail-outline-rounded"} />
                                    <p class="text-sm text-gray-600">
                                        {phone.name || "Phone Number"}   
                                    </p>
                                </div>

                                <div>
                                    {#if phone.phoneNumber}    
                                        <a 
                                            class="relative inline-block font-medium text-black before:absolute before:bottom-0.5 before:start-0 before:-z-1 before:w-full before:h-1 before:bg-tertiary-400 hover:before:bg-black focus:outline-hidden focus:before:bg-black" 
                                            href={`tel:${phone.phoneNumber}`}
                                        >
                                            {phone.phoneNumber}
                                        </a>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                   </div>
                {/if}


            <!-- Grid -->
            <div class=" hidden grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
                <div class="flex gap-4">
                <svg class="shrink-0 size-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"></path><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"></path></svg>

                </div>

                <div class="flex gap-4">
                <svg class="shrink-0 size-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>

                <div class="grow">
                    <p class="text-sm text-gray-600">
                    Call us
                    </p>
                    <p>
                    <a class="relative inline-block font-medium text-black before:absolute before:bottom-0.5 before:start-0 before:-z-1 before:w-full before:h-1 before:bg-tertiary-400 hover:before:bg-black focus:outline-hidden focus:before:bg-black" href="mailto:example@site.so">
                        +44 222 777-000
                    </a>
                    </p>
                </div>
                </div>
            </div>
            <!-- End Grid -->
            </div>
        </div>

    </div>
</div>
