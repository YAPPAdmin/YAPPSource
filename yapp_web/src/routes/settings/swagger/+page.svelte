<!-- https://medium.com/@kaloyanmanev/using-swagger-ui-in-sveltekit-app-2202344b3542 -->
<script lang="ts">
    import { onMount } from "svelte";
    import SwaggerUI from "swagger-ui";
    import SwaggerSpec from './swagger.json';
    import 'swagger-ui/dist/swagger-ui.css';
    


    onMount(() => {
        SwaggerUI({
            spec: SwaggerSpec,
            dom_id: "#swaggerUIcont",
        });
    });


</script>

<div id="swaggerUIcont"/>

<p>SwaggerUi</p>