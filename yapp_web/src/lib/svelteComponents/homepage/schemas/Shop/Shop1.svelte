<script lang="ts" context="module">

    export type Shop1Schema = {
        title: string;
        items: [];
    }

    export const Shop1SchemaDefinition = {
        title: {
            type: "string",
            label: "Title",
            description: "Title",
            input: "text",
            default: "Shop",
        },
        items: {
            type: "array",
            label: "Items",
            description: "Items",
            itemSchema: {
                type: "object",
                schema: {
                    name: {type: "string", label: "Name", description: "Name", default: "Shop Item"},
                    price: {type: "number", label: "Price", description: "Item Price", default: 10},
                    shopLink: {type: "string", label: "Shop Link", description: "Shop Link", default: ""},
                    availability: {type: "select", label: "Availability", description: "Availability", options: ["Available", "Available Soon", "Not Available", "Presale"], default: "Not Available" },
                    productImages: {
                        type: "array",
                        label: "Product Images",
                        description: "Product Images",
                        itemSchema: {
                            type: "object",
                            label: "Product Image",
                            itemSchema: {
                                name: {type: "string", label: "Image Alt Name", description: "Alternateive Name", default: ""},
                                image: {type: "string", label: "Image URL", description: "Image URL", default: "https://picsum.photos/1080/1080"},
                            }
                        }
                    },
                    properties: {
                        type: "array",
                        label: "Properties",
                        description: "Properties",
                        itemSchema: {
                            type: "object",
                            schema: {
                                key: {type: "string", label: "Name", description: "Name", default: "Name"},
                                value: {type: "string", label: "Value", descriptoin: "Value", default: "Value"},
                            }
                        }
                    }
                }
            }
        }
    };

    export const Shop1DefaultSchema: Shop1Schema = {
        title: "Shop",
        items: [
            {
                name: "Shop Item 1",
                price: 8,
                productImages: [
                    { name: "Placeholder Image", image: "https://picsum.photos/seed/3/1080/1080"}
                ],
                availability: "Not Available",
                properties: [
                    { key: "Name", value: "Value" }
                ],
            },
            {
                name: "Shop Item 2",
                price: 15,
                productImages: [
                    { name: "Placeholder Image", image: "https://picsum.photos/seed/3/1080/1080"}
                ],
                availability: "Available",
                properties: [
                    { key: "Name", value: "Value" }
                ],
            },
            {
                name: "Shop Item 3",
                price: 81,
                productImages: [
                    { name: "Placeholder Image", image: "https://picsum.photos/seed/3/1080/1080"}
                ],
                availability: "Available",
                properties: [
                    { key: "Name", value: "Value" }
                ],
            }
        ]
    };

</script>

<script lang="ts">
    export let componentContent;
    console.log(componentContent)
</script>



<div class="max-w-[85rem] px-4 sm:px-6 lg:px-8 py-12 lg:py-24 mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {#if componentContent.items && componentContent.items.length > 0} 
            {#each componentContent.items as item}
                <div class="group flex flex-col">
                    <div class="relative">

                        {#if item.productImages && item.productImages.length > 0}
                            {#each item.productImages as image}
                                <div class="aspect-4/4 overflow-hidden rounded-2xl">
                                    <img 
                                        class="size-full object-cover rounded-2xl" 
                                        src={image.image} 
                                        alt={image.name}>
                                </div>
                            {/each}
                        {/if}

                        <div class="pt-4">
                            {#if item.name}
                                <h3 class="font-medium md:text-lg text-black">
                                    {item.name}
                                </h3>
                            {/if}

                            {#if item.price}
                                <p class="mt-2 font-semibold text-black">
                                    {item.price},-- €
                                </p>
                            {/if}
                        </div>

                        <a class="after:absolute after:inset-0 after:z-1" href={item.shopLink}></a>
                    </div>

                    <div class="mb-2 mt-4 text-sm">
                        {#if item.properties && item.properties.length > 0}
                            <div class="flex flex-col">
                                {#each item.properties as property}
                                    <div class="py-3 border-t border-gray-200">
                                        <div class="grid grid-cols-2 gap-2">
                                            <div class="text-left">
                                                <span class="font-medium text-black">{property.key}</span>
                                            </div>

                                            <div class="text-right">
                                                <span class="text-black">{property.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <div class="mt-auto text-white">
                        {#if item.availability == "Presale"}
                            <a class="py-2 px-3 w-full inline-flex justify-center items-center gap-x-2 text-sm font-medium text-nowrap rounded-xl border border-transparent bg-secondary-400 hover:bg-secondary-500 focus:outline-hidden focus:bg-secondary-500 transition cursor-pointer" href={item.shopLink}>
                                Pre Order Now
                            </a>
                        {:else if item.availability == "Available"}
                            <a class="py-2 px-3 w-full inline-flex justify-center items-center gap-x-2 text-sm font-medium text-nowrap rounded-xl border border-transparent bg-primary-400 hover:bg-primary-500 focus:outline-hidden focus:bg-primary-500 transition cursor-pointer" href={item.shopLink}>
                                Buy Now
                            </a>
                        {:else if item.availability == "Available Soon" || "Not Available"}
                            <button disabled={true} class="py-2 px-3 w-full inline-flex justify-center items-center gap-x-2 text-sm font-medium text-nowrap rounded-xl border border-transparent bg-primary-400 hover:bg-primary-500 focus:outline-hidden focus:bg-primary-500 transition disabled:opacity-50 disabled:pointer-events-none" href={item.shopLink}>
                                Come back later!
                            </button>
                        {/if}

                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

