import { SurrealDB } from "$lib/database/surrealdb";
import BlogPost from "$lib/svelteComponents/blog/BlogPost.svelte";
import { User } from "$lib/utils/auth/User";
import { UserService } from "$lib/utils/auth/UserService";
import { BlogPostN, type BlogPostVersion } from "$lib/utils/blog";
import { BlogService } from "$lib/utils/blogUtilsSS";
import { redirect, type RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { v4 as uuidv4 } from 'uuid';


export const GET: RequestHandler = async (event) => {
    console.log("[API/BLOG]GET BLOG")

    const session = await event.locals.auth();

    if (!session || !session.user) {
        throw redirect(303, "/signin");
    }

    // Get User
    const user = session.user;
    const dbUser = await SurrealDB.selectByProperty("user", "email", user.email)
    
    // Check if user exists
    if(!dbUser) {
        throw redirect(303, "/");
    }

    return new Response(JSON.stringify({ message: "Success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export const POST: RequestHandler = async (event) => {
    console.log("[API/BLOG] POST BLOG");

    try {
        const session = await event.locals.auth();

        if (!session || !session.user) {
            throw redirect(303, "/signin");
        }

        // Get User
        const user = session.user;
        const dbUser = User.fromDbRecord(await SurrealDB.selectByProperty("user", "email", user.email))
        

        // Check if user exists
        if(!dbUser) {
            throw redirect(303, "/");
        }

        let newBlogPost;
        let requestBlogPost: BlogPostN | null = null;

        // Check if a blogpost input has been sent as well
        try {
            requestBlogPost = await event.request.json();
        } catch {
            requestBlogPost = null; 
        }

        if(requestBlogPost) {
            // Create new BlogPost from request input
            newBlogPost = requestBlogPost;
        } else {
            const blogPostId = uuidv4().replace(/-/g, "");
            const timestamp = new Date();

            // Empty start version for new Blog
            const emptyVersion: BlogPostVersion = {
                id: uuidv4().replace(/-/g, ""),
                blogPostId: blogPostId,
                versionNumber: 1,
                title: "New Blog Post",
                authorId: dbUser.getId(),
                updatedAt: timestamp,
                public: false,
                active: true,
                description: "Empty Description",
                versionTitle: "Empty Version Title",
                versionDescription: "Empty Version Description",
                category: "",
                tags: [],
                content: "",
                
            };

            // New Blog
            newBlogPost = new BlogPostN(
                blogPostId,               
                [],                         
                emptyVersion.id,                        
                emptyVersion.title,          
                dbUser.getId(),             
                emptyVersion.description,        
                emptyVersion.category,                         
                emptyVersion.tags,                         
                timestamp,                  
            )

            // Add empty version to new blog
            newBlogPost.versions.push(emptyVersion);

        }


        const validation = await BlogService.verifyBlogPost(newBlogPost, dbUser.getId());
        
        if(!validation.valid) {
            return new Response(JSON.stringify({ message: "Error creating new BlogPost", errors: validation.errors }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }


        const dbBlogPost = await BlogService.createBlogPost(newBlogPost);

        return new Response(JSON.stringify({ message: "Success", blogPost: dbBlogPost }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err: any) {
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
                errors: [err.message],
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

export const PUT: RequestHandler = async (event) => {
    console.log("[API/BLOG] UPDATE BLOG");

    const session = await event.locals.auth();

    if (!session || !session.user) {
        throw redirect(303, "/signin");
    }

    // Get User
    const user = session.user;
    const dbUser = User.fromDbRecord(await SurrealDB.selectByProperty("user", "email", user.email))
    

    // Check if user exists
    if(!dbUser) {
        throw redirect(303, "/");
    }

    const { createVersion, updateVersion,  } = await event.request.json();

    // Fetch corresponding Blog
    const blogPost = await SurrealDB.selectByProperty("blog", "id", updateVersion.blogPostId)

    // Check and update versions
    if(createVersion) {
        console.log("[API/BLOG] CREATE VERSION");
        
        // Update Blogpost
        await BlogService.addVersion(dbUser.getId(), createVersion); 

        // Refetch updated blog
        const updatedBlogPost = await SurrealDB.selectByProperty("blog", "id", createVersion.blogPostId)

        return json({ message: "Success", updatedBlog: updatedBlogPost}, { status: 201 })

    } else if(updateVersion) {
        console.log("[API/BLOG] UPDATE VERSION");

        // Update Blogpost
        await BlogService.updateVersion(dbUser.getId(), updateVersion);

        // Refetch updated blog
        const updatedBlogPost = await SurrealDB.selectByProperty("blog", "id", updateVersion.blogPostId)

        return json({ message: "Success", updatedBlog: updatedBlogPost}, { status: 201 })

    }

    // Verify Update as valid version
    const updatedBlog = undefined;


    return json({ message: "Success", updatedBlog: updatedBlog}, { status: 201 })

}

export const DELETE: RequestHandler = async (event) => {
    console.log("[API/BLOG] DELETE BLOG/DELETE VERSION");

    const session = await event.locals.auth();

    if (!session || !session.user) {
        throw redirect(303, "/signin");
    }

    // Get User
    const user = session.user;
    const dbUser = User.fromDbRecord(await SurrealDB.selectByProperty("user", "email", user.email))
    
    // Check if user exists
    if(!dbUser) {
        throw redirect(303, "/");
    }

    const {blogPostId, versionId } = await event.request.json();

    // Delete entire blogpost
    if(!versionId && blogPostId) {
        console.log(`[API/BLOG] DELETE BLOGPOST ${blogPostId}`);

        const result = await BlogService.deleteBlogPost(blogPostId)

        if(!result) {
            return json({ message: "Error deleting BlogPost"}, { status: 500 });
        }

        const updatedBlogPost = await SurrealDB.selectByProperty("blog", "id", blogPostId)

        return json({ message: "Blogpost deleted",  updatedBlog: updatedBlogPost} , { status: 200})

    } else if(versionId && blogPostId) {
        // Delete a specific Version
        console.log(`[API/BLOG] DELETE VERSION ${versionId}`);
        const result = await BlogService.deleteVersion(dbUser.getId(), blogPostId, versionId);

        if(!result) {
            return json({ message: "Error deleting Version"}, { status: 500 });
        }

        const updatedBlogPost = await SurrealDB.selectByProperty("blog", "id", blogPostId)

        return json({ message: "Version deleted",  updatedBlog: updatedBlogPost} , { status: 200})
    } else {
        return json({ message: "Missing ids"} , {status: 400})
    }


}