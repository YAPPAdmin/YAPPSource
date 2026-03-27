<script lang="ts">
    import EmailInput from "$lib/helperComponents/EmailInput.svelte";
    import type { DBConfigData } from "$lib/interfaces";
    import { SurrealDB } from "../../../../../../TRASHCAN/surrealdb";
    import { onMount } from "svelte";

    let settings: DBConfigData;
    let newSettings: DBConfigData; 
    let settingsLoaded: Boolean = false;

    let EmailInputExportValue: string;
    let PrivateInputExportValue: string;


    onMount(async () => {
        const result: DBConfigData = await SurrealDB.getDBObj("settings", "settings")

        if(result) {
            settings = result;

            // Populate newSettings with old settings
            newSettings = settings;

            // Populate page data
            EmailInputExportValue = newSettings.GMAIL_USER;
            PrivateInputExportValue = newSettings.GMAIL_PASSWORD;

            settingsLoaded = true;
        } else {
            console.log("Error loading Settings")
            throw new Error("Error loading Settings")
        }
    })

    // Update new settings
    $: {
        if(settingsLoaded){
            newSettings.GMAIL_USER = EmailInputExportValue;
            newSettings.GMAIL_PASSWORD = PrivateInputExportValue;
        }
    }

    // async function onSave() {
    //     console.log("Settings: ", settings);
    //     console.log("New Settings: ", newSettings);

    //     try {
    //         // await SurrealDB.updateObj("settings", "settings", newSettings);
    //         console.log("Settings updated successfully");

    //         // Reload the settings after saving
    //         const reloadResult = await SurrealDB.getDBObj("settings", "settings");
    //         if (reloadResult) {
    //             settings = reloadResult;
    //             newSettings = { ...settings };
    //         }
    //     } catch (error) {
    //         console.error("Failed to update settings:", error);
    //         // Handle the error (e.g., show an alert to the user)
    //     }
    // }


</script>


<h1>Settings</h1>
<p1>Manage your YAPP Application's settings</p1>

<hr>

<h2>Email Settings</h2>
<p>This email address is used for automatically send emails to your customers.</p>
<EmailInput 
    lable={"Change Email"}
    iconName={"material-symbols-light:alternate-email-rounded"}
    helperText={""}
    bind:EmailInputExportValue
></EmailInput>


<p>This is the password for the email above.</p>
<PrivatTextInput bind:PrivateInputExportValue></PrivatTextInput>




<button class="defaultButton fixed bottom-4 right-4 z-50">Save Changes</button>