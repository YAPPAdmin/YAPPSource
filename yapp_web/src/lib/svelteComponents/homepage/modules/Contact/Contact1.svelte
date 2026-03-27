<script context="module" lang="ts">
    import type { BlockConfig } from "../../utils/blocks";

    export const defaultContactData = {
        addresses: [
            {
                name: "Headquarters",
                country: "Austria",
                state: "Carinthia",
                street1: "Musterstraße 654",
                postalCode: 9500,
                city: "Villach"
            }
        ],
        phoneNumbers: [
            { label: "Call Us!", phoneNumber: "+43 123 4567890" }
        ],
        email: [
            { label: "Email Us!", email: "test@placeholder.com" }
        ]
    };

    export const blockConfig: BlockConfig = {
        name: "Contact Section",
        icon: "material-symbols-light:contact-mail-outline-rounded",
        description: "A section displaying office addresses, emails, and phone numbers.",
        schema: {
            content: [
                {
                    key: "title",
                    label: "Headline",
                    type: "text",
                    default: "Contact Us",
                },
                {
                    key: "addresses",
                    label: "Addresses",
                    type: "array",
                    default: defaultContactData.addresses,
                    itemSchema: {
                        type: "object",
                        schema: {
                            name: { type: "string", label: "Location Name" },
                            street1: { type: "string", label: "Street" },
                            postalCode: { type: "number", label: "Postal Code" },
                            city: { type: "string", label: "City" },
                            country: { type: "string", label: "Country" },
                            state: { type: "string", label: "State" }
                        }
                    }
                },
                {
                    key: "phoneNumbers",
                    label: "Phone Numbers",
                    type: "array",
                    default: defaultContactData.phoneNumbers,
                    itemSchema: {
                        type: "object",
                        schema: {
                            label: { type: "string", label: "Label (e.g., Mobile)" },
                            phoneNumber: { type: "string", label: "Phone Number" }
                        }
                    }
                },
                {
                    key: "email",
                    label: "Email Addresses",
                    type: "array",
                    default: defaultContactData.email,
                    itemSchema: {
                        type: "object",
                        schema: {
                            label: { type: "string", label: "Label (e.g., Support)" },
                            email: { type: "string", label: "Email Address" }
                        }
                    }
                }
            ],
            settings: [
                {
                    key: "image",
                    label: "Side Image",
                    type: "image",
                    default: "https://picsum.photos/1080/1920",
                    group: "Design"
                }
            ]
        }
    }
</script>

<script lang="ts">
    import ImageCard from "$lib/svelteComponents/display/Images/ImageCard.svelte";
    import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";

    export let content: Record<string, any> = {};
    export let settings: Record<string, any> = {};

    function getDefaultContent(key: string) {
        return blockConfig.schema.content.find(item => item.key === key)?.default;
    }
    function getDefaultSetting(key: string) {
        return blockConfig.schema.settings.find(item => item.key === key)?.default;
    }

    $: title = content.title ?? getDefaultContent("title");
    
    $: imageSetting = settings.image ?? getDefaultSetting("image");
    $: imageUrl = typeof imageSetting === 'object' && imageSetting !== null && 'src' in imageSetting ? imageSetting.src : imageSetting;
    $: imageAlt = typeof imageSetting === 'object' && imageSetting !== null && 'alt' in imageSetting ? imageSetting.alt : "Contact Office";

    $: addresses = content.addresses ?? defaultContactData.addresses;
    $: phoneNumbers = content.phoneNumbers ?? defaultContactData.phoneNumbers;
    $: emails = content.email ?? defaultContactData.email;
</script>

<div class="max-w-7xl sm:px-6 p-4 mx-auto w-full">
    
    <div class="my-6 max-w-2xl text-center mx-auto">
        <div class="font-medium text-2xl sm:text-4xl canvas-content">
            {@html title}
        </div>
    </div>

    <div class="w-full grid lg:grid-cols-2 lg:items-center gap-8 lg:gap-16">
        
        {#if imageUrl}
            <div class="w-full aspect-4/3 lg:aspect-square overflow-hidden bg-gray-100 rounded-2xl shadow-lg relative">
                <ImageCard src={imageUrl} alt={imageAlt} sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
        {/if}

        <div class="flex flex-col gap-10">
            
            {#if addresses && addresses.length > 0}
                <div>
                    <h3 class="mb-4 text-lg font-bold text-gray-900 border-b pb-2">Our Locations</h3>
                    <div class="grid sm:grid-cols-2 gap-6">
                        {#each addresses as address}
                            <address class="not-italic flex flex-col gap-1 text-gray-600">
                                {#if address.name} <strong class="text-gray-900">{address.name}</strong> {/if}
                                
                                <div class="flex gap-2 items-start mt-1">
                                    <div class="pt-0.5 text-primary-500">
                                        <Iconify iconId="material-symbols-light:location-on-outline-rounded" height={20} />
                                    </div>
                                    <div class="flex flex-col text-sm">
                                        {#if address.street1} <span>{address.street1}</span> {/if}
                                        {#if address.street2} <span>{address.street2}</span> {/if}
                                        <span>
                                            {#if address.postalCode}{address.postalCode} {/if}
                                            {#if address.city}{address.city}{/if}
                                        </span>
                                        <span class="text-gray-400">
                                            {#if address.state}{address.state}, {/if}
                                            {#if address.country}{address.country}{/if}
                                        </span>
                                    </div>
                                </div>
                            </address>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if (emails && emails.length > 0) || (phoneNumbers && phoneNumbers.length > 0)}
                <div>
                    <h3 class="mb-4 text-lg font-bold text-gray-900 border-b pb-2">Get in Touch</h3>
                    <div class="grid sm:grid-cols-2 gap-6">
                        
                        {#each emails as email}
                            <div class="flex gap-3 items-start">
                                <div class="p-2 shrink-0">
                                    <Iconify iconId="material-symbols-light:mail-outline-rounded" height={24} />
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{email.label || "Email"}</span>
                                    {#if email.email}
                                        <a href={`mailto:${email.email}`} class="text-gray-500 hover:text-primary-500 font-medium transition-colors">
                                            {email.email}
                                        </a>
                                    {/if}
                                </div>
                            </div>
                        {/each}

                        {#each phoneNumbers as phone}
                            <div class="flex gap-3 items-start">
                                <div class="p-2 shrink-0">
                                    <Iconify iconId="material-symbols-light:call" height={24} />
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{phone.label || "Phone"}</span>
                                    {#if phone.phoneNumber}
                                        <a href={`tel:${phone.phoneNumber}`} class="text-gray-500 hover:text-primary-600 font-medium transition-colors">
                                            {phone.phoneNumber}
                                        </a>
                                    {/if}
                                </div>
                            </div>
                        {/each}

                    </div>
                </div>
            {/if}

        </div>
    </div>
</div>