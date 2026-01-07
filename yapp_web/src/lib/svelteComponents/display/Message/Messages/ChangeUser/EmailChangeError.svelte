<script lang="ts">
  import Iconify from "$lib/svelteComponents/iconify/Iconify.svelte";

</script>

<div class="p-2 flex flex-row grow gap-x-5 ">

        <!-- Icon -->
        <Iconify height={36} iconId={"material-symbols-light:mark-email-unread-outline-rounded"} />

        <!-- Test -->
        <div class="flex flex-col grow">
            
            <!-- Heading -->
            <h2 class="!m-0 !mb-4 text-lg font-semibold text-gray-800">
                Error changeing your Email!
            </h2>

            <!-- Content -->
            <div>
                <p class="!text-sm !mt-2">
                    An Error occured whilest changeing your Email Address!
                </p>
            </div>
        </div>


</div>

