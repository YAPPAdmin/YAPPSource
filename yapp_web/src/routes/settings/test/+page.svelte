<script lang="ts">
  import ResultViewer from "$lib/svelteComponents/helperComponents/ResultViewer.svelte";


    let pageResult: any;
    let status: number | undefined = undefined;
    let ok: boolean | undefined = undefined;
    let searchParams: [] = [];
</script>

<div class="space-y-10">

    <!-- Result -->
    <div class="bg-background-800 min-h-64 p-10 rounded border-6 border-dashed border-background-500">
        <h2>Results</h2>

        <div class="p-2">
            <div class="flex justify-between items-center">
                <div class="w-1/2">
                    <h3>Status</h3>
                    {#if ok != undefined && status != undefined}
                        {#if ok}
                            <p class="text-success-default font-semibold">Status: {status}</p>
                            <p class="text-success-default font-semibold">OK: {ok}</p>
                        {:else}
                            <p class="text-error-default font-semibold">Status: {status}</p>
                            <p class="text-error-default font-semibold">OK: {ok}</p>
                        {/if}
                    {/if}
                </div>

                <div class="w-1/2">
                    <h3>Search Parameters</h3>
                    {#if searchParams.length}
                        {#each searchParams as param}
                            {#if param}
                                <p>- {param}</p>
                            {/if}
                        {/each}
                    {/if}
                </div>
            </div>

            {#if pageResult}
                <ResultViewer data={pageResult} />
            {/if}
            
        </div>

    </div>



    <!-- UserAPI -->
    <div>
        <h3>/api/user</h3>

        <div class="flex justify-around">
            <div class="DEVbutton h-fit flex flex-col">
                GET
                <div class="space-y-5 my-5 flex flex-col">
                    <input class="max-w-40" placeholder="UserID"  id="getUserUserId"/>
                    <input class="max-w-40" placeholder="Username" id="getUserUsername"/>
                    <input class="max-w-40" placeholder="Role" id="getUserRole"/>
                    <input class="max-w-40" placeholder="E-Mail" id="getUserEmail"/>
                    <input class="max-w-40" placeholder="Phone" id="getUserPhone"/>
                </div>

                <button class="DEVbutton" on:click={(async() => {
                    status = undefined;
                    ok = undefined;
                    pageResult = undefined;
                    searchParams = [];

                    const userId = document.getElementById("getUserUserId")?.value;
                    const userName = document.getElementById("getUserUsername")?.value;
                    const role = document.getElementById("getUserRole")?.value;
                    const email = document.getElementById("getUserEmail")?.value;
                    const phone = document.getElementById("getUserPhone")?.value;

                    const params = new URLSearchParams({
                        userId,
                        userName,
                        role,
                        email,
                        phone,
                    })

                    const result = await fetch(`/api/user?${params.toString()}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }, 
                    })
                    
                    status = result.status;
                    ok = result.ok;
                    pageResult = await result.json();

                    params.forEach(element => {
                        searchParams.push(element)
                    });

                    console.log("RESULT: ", searchParams)
                })} >Send</button>
            </div>

            <div class="flex items-center justify-around">
                <div class="DEVbutton h-fit flex flex-col">
                    POST 

                    <div class="space-y-5 my-5 flex flex-col">
                            
                            <input class="max-w-40" placeholder="Username" id="username" />
                            <input class="max-w-40" placeholder="Password" id="password" />
                            <input class="max-w-40" placeholder="Role" id="role" />
                            <input class="max-w-40" placeholder="E-Mail" id="email" />
                            <input class="max-w-40" placeholder="EmailVerified" id="emailVerified" />
                            <input class="max-w-40" placeholder="Firstname" id="firstname" />
                            <input class="max-w-40" placeholder="Lastname" id="lastname" />
                            <input class="max-w-40" placeholder="Phone" id="phone" />
                            <input class="max-w-40" placeholder="Birthdate" id="birthdate" />
                            <input class="max-w-40" placeholder="Pronouns" id="pronouns" />
                
                    </div>

                    <button class="DEVbutton" on:click={(async() => {
                        status = undefined;
                        ok = undefined;
                        pageResult = undefined;
                        searchParams = [];

                        const username = document.getElementById("username")?.value;
                        const password = document.getElementById("password")?.value;
                        const role = document.getElementById("role")?.value;
                        const email = document.getElementById("email")?.value;
                        const emailVerified = document.getElementById("emailVerified")?.value;
                        const firstname = document.getElementById("firstname")?.value;
                        const lastname = document.getElementById("lastname")?.value;
                        const image = document.getElementById("image")?.value;
                        const phone = document.getElementById("phone")?.value;
                        const birthdate = document.getElementById("birthdate")?.value;
                        const pronouns = document.getElementById("pronouns")?.value;

                        const result = await fetch(`/api/user/`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            }, 
                            body: JSON.stringify({
                                username: username, 
                                password: password, 
                                role: role, 
                                email: email, 
                                emailVerified: emailVerified, 
                                firstname: firstname, 
                                lastname: lastname, 
                                image: image, 
                                phone: phone, 
                                birthdate: birthdate, 
                                pronouns: pronouns, 
                            })
                        })
                        
                        status = result.status;
                        ok = result.ok;
                        pageResult = await result.json();

                        console.log("RESULT: ", searchParams)

                    })} >Send</button>

                </div>
            </div>

            <div class="flex items-center justify-around">
                <div class="DEVbutton h-fit flex flex-col">
                    Update
                </div>
            </div>

            <div class="flex items-center justify-around">
                <div class="DEVbutton h-fit flex flex-col">
                    Delete

                    <div class="space-y-5 my-5 flex flex-col"> 
                            <input class="max-w-40" placeholder="UserId" id="deleteId" />
                    </div>

                    <button class="DEVbutton" on:click={(async() => {
                        status = undefined;
                        ok = undefined;
                        pageResult = undefined;
                        searchParams = [];

                        const userId = document.getElementById("deleteId")?.value;

                        const params = new URLSearchParams({
                            userId,
                        })

                        const result = await fetch(`/api/user?${params.toString()}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            }, 
                        })
                        
                        status = result.status;
                        ok = result.ok;
                        pageResult = await result.json();

                    })} >Send</button>

                </div>
            </div>
        </div>
    </div>


</div>