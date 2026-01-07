<script>
  import EmailInput from "$lib/helperComponents/EmailInput.svelte"
  import Table from "$lib/adminComponents/Table.svelte"

  let testheaders = ["Name", "Age", "Address", "Action"];
  let testcontent = [
        {name: "John Brown", age: 30, address: "New York No. 1 Lake Park"},
        {name: "Jim Green", age: 27, address: "London No. 1 Lake Park"},
        {name: "Joe Black", age: 31, address: "Sidney No. 1 Lake Park"},
    ];

    let EmailInputExportValue = "";

</script>



<!-- Admin Account -->

<div>

<!-- 
    Admin Email
    Admin Name 
-->


  <h1>Admin Account Settings</h1>
  <p1>Change personal settings</p1>

  <hr>

  <h2>Emails</h2>

  <hr>

  <Table headers={testheaders} content={testcontent} firstColumnHighlight={true}></Table>
  <EmailInput bind:EmailInputExportValue lable={"Add Email"} iconName={"material-symbols-light:alternate-email-rounded"}></EmailInput>

</div>