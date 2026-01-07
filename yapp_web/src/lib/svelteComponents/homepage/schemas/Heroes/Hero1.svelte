<script lang="ts" context="module">

    export type Hero1Schema = {
        title: string;
        subtitle: string; 
        buttons?: customButtons[];
        reviews?: Review[];
    };

    export const Hero1SchemaDefinition = {
        title: {
            type: "string",
            label: "Title",
            description: "Main Heading Title",
            input: "text",
        },
        subtitle: {
            type: "string",
            label: "Subtitle",
            description: "Subtitle underneath Main Title",
            input: "textarea",
        },
        buttons: {
            type: "array",
            label: "Buttons",
            description: "Buttons",
            itemSchema: {
                type: "object",
                schema: {
                    label: { type: "string", label: "Button Label", description: "Button Label"},
                    colour: { type: "select", label: "Button Color", options: ["primary","secondary","accent"]},
                    action: { type: "string", label: "Action", description: "JS Handler Name" }
                }
            }
        },
        reviews: {
            type: "array",
            label: "Reviews",
            description: "Reviews",
            itemSchema: {
                type: "object",
                schema: {
                    name: { type: "string", label: "Reviewer Name", description: "Name"},
                    source: { type: "string", label: "Source", description: "Source"},
                    rating: { type: "number", label: "Rating", description: "Rating"},
                    logo: { type: "string", label: "Logo URL", description: "Logo"},
                }
            }
        }
    };

    export const Hero1DefaultSchema: Hero1Schema = {
        title: "Start building your online presence with YAPP!",
        subtitle: "Customize this hero section so show your visitors your online identity! Allow them to quickly see what you are about.",
        buttons: [],
        reviews: [],
    }

</script>

<script lang="ts">
    import { dev } from "$app/environment";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";
    import type { customButtons, YAPPComponentBase } from "$lib/customRenderer/customRendere";
    import Review from "../subBlocks/review.svelte";

    export let componentContent;
</script>

<div class="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">

    <div class="grid md:grid-cols-2 gap-4 md:gap-8 xl:gap-20 md:items-center">
        <div>
            <Tooltip text={"Title"} condition={dev}>
                <h1 class="block text-3xl font-bold text-gray-800 sm:text-4xl lg:text-6xl lg:leading-tight">{componentContent.title}</h1>
            </Tooltip>

            <Tooltip text={"Subtitle"} condition={dev}>
                <p class="mt-3 text-lg text-gray-800">{componentContent.subtitle}</p>
            </Tooltip>


            <!-- Buttons -->
            <Tooltip text={"Buttons"} condition={dev} fullWidth>
                {#if componentContent.buttons && componentContent.buttons.length > 0}
                    <div class="mt-7 flex flex-wrap gap-3 justify-start items-center w-full text-left">
                        {#each componentContent.buttons as button}
                            <button 
                                aria-label={button.label ?? "Call to action"}
                                on:click={button.action}
                                class={`btn btn-${button.colour ?? "primary"} text-left`}
                            >
                                {button.label || "Click Me!"}
                            </button>
                        {/each}
                    </div>
                {/if}
            </Tooltip>

            <!-- Review -->
            <Tooltip text={"Reviews"} condition={dev}>
                <div class="mt-6 lg:mt-10 grid grid-cols-2 gap-x-5">
                    {#if Array.isArray(componentContent.reviews)}
                        {#each componentContent.reviews as review}
                            <Review review={{
                                name: review.name,
                                source: review.source,
                                rating: review.rating,
                                maxRating: review.maxRating,
                                reviewCount: review.reviewCount,
                                type: review.type,
                                logo: review.logo,
                            }}/>
                        {/each}
                    {/if}

                </div>
            </Tooltip>
        <!-- End Review -->
        </div>
        <!-- End Col -->

        <div class="relative p-5 ms-4">
            <img class="w-full rounded-md" src="https://images.unsplash.com/photo-1665686377065-08ba896d16fd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&h=800&q=80" alt={componentContent.imageAlt ?? "Hero image"}>
        </div>
        <!-- End Col -->
    </div>

</div>
