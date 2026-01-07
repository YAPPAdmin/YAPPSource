<script lang=ts>
    import type { BlogPost } from "$lib/classes";

    export let blogPost: BlogPost;

</script>

<div>

    <p>Test {blogPost.title}</p>

</div>