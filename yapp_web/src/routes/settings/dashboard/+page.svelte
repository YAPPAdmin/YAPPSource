<script lang="ts">
    import { page } from "$app/state";
    import LogsDisplay from "$lib/svelteComponents/settings/dashboard/logsDisplay.svelte";
    import StaffDisplay from "$lib/svelteComponents/settings/dashboard/StaffDisplay.svelte";
    import { fileUploadStack } from "$lib/uploads/upload";

	let serializedLogs = page.data.serializedLogs;
	let total = page.data.total;
	let users = page.data.users
	let user = page.data.session.user

</script>


<div class="space-y-10">

    <div class="w-full h-100">

        <button 
            class="defaultButton"
            on:click={(() => fileUploadStack.open({            
                hasDescription: true,
                hasName: true,
                hasSource: true,
        }))}>
            Test
        </button>

    </div>

    <!-- <StaffDisplay users={users} user={user}/> -->

    <LogsDisplay logs={serializedLogs} total={total}/>

</div>
