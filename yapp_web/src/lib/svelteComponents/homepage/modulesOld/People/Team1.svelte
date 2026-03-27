<script lang="ts" context="module">

    export type Team1Schema = {
        title: string,
        subtitle?: string,
        additionalPeople: {
            name: string,
            role?: string,
            profilePicture?: string,
            links?: {
                name: string,
                url: string,
                logo: string,
            }[]
        }[]
    }

    export const Team1SchemaDefinition = {
        title: {
            type: "string",
            label: "Title",
            description: "Main Heading Title",
            input: "text",
            default: "Meet the Crew",
        },
        subtitle: {
            type: "string",
            label: "Subtitle",
            description: "Subtitle underneath Main Title",
            input: "textarea",
            default: "Creative People"
        },
        additionalPeople: {
            type: "array",
            label: "Additional People",
            description: "Your Teammembers",
            itemSchema: {
                type: "object",
                schema: {
                    name: { type: "string", label: "Name", description: "First and lastname of your Teammember", default: "Max Mustermann" },
                    role: { type: "string", label: "Role", description: "Your Teammembers company role", default: "Member"},
                    profilePicture: { type: "string", label: "Profile Picture", description: "Your Teammembers Profile Picture", default: "https://picsum.photos/300/300"},
                    links: {
                        type: "array",
                        label: "Social Links",
                        description: "Your Teammembers Socials",
                        itemSchema: {
                            type: "object",
                            schema: {
                                name: { type: "string", label: "Platform", description: "The name of the social media Platform", default: ""}, 
                                url: { type: "string", label: "Platform URL", description: "URL of the Social Media Platform", default: ""},
                                logo: { type: "string", label: "Platform Logo", description: "Logo of the Social Media Platform", default: ""},
                            }
                        }
                    }
                }
            }
        }
    }

    export const Team1DefaultSchema: Team1Schema = {
        title: "Meet the Crew",
        subtitle: "Creative People",
        additionalPeople: [
            {
                name: "Max Mustermann",
                role: "Placeholder",
                profilePicture: "https://picsum.photos/300/300",
                links: [
                    {
                        name: "instagram",
                        url: "http://instagram.com/",
                        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
                    }
                ],
            }
        ],
    };
    

</script>

<script lang="ts">
    import { dev } from "$app/environment";
    import Tooltip from "$lib/svelteComponents/base/Tooltip.svelte";

	export let componentContent;

</script>


<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
	<!-- Title -->
	<div class="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
		<h2 class="text-2xl font-bold md:text-4xl md:leading-tight">{componentContent.title}</h2>
		<p class="mt-1 text-gray-600">{componentContent.subtitle}</p>
	</div>
	<!-- End Title -->

	<!-- Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">

		{#each componentContent.additionalPeople ?? [] as person}
			<div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
				<img class="rounded-lg size-20" src={person.profilePicture} alt={person.name}>

				<div class="grow">
					<div>
						<h3 class="font-medium text-gray-800">
							{person.name}
						</h3>

						<p class="mt-1 text-xs uppercase text-gray-500">
							{person.role}
						</p>
					</div>

					<!-- Social Brands -->
					<div class="mt-2 sm:mt-auto flex justify-center items-center space-x-2.5">
						{#each person.links as link}
							<a
								href={link.url}
								class="inline-flex justify-center items-center text-gray-500 rounded-full hover:text-gray-800 focus:outline-hidden focus:text-gray-800 transition-transform duration-200"
							>
								<img
									src={link.logo}
									alt={link.name}
									class="w-5 h-5 object-contain transform transition-transform duration-200 hover:scale-125"
								/>
							</a>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	
  </div>
  <!-- End Grid -->
</div>
