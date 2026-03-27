import { dev } from "$app/environment";
import { SurrealDB } from "$lib/database/newSurrealDB";
import { User } from "$lib/utils/auth/User";
import { UserService } from "$lib/utils/auth/UserService";
import { BlogPost, type BlogPostVersion } from "$lib/utils/blog/blog";
import { BlogService } from "$lib/utils/blog/blogUtilsSS";
import { redirect, type RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { v4 as uuidv4 } from 'uuid';


export const GET: RequestHandler = async (event) => {
    console.log("[API/BLOG]GET BLOG")

    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    const getRegistry = event.url.searchParams.get("getRegistry");
    const blogId = event.url.searchParams.get("blogId");

    if(getRegistry) {
        const result = await SurrealDB.select({ table: "blogreg" })
        return new Response(JSON.stringify({ registry: result}), { status: 200 });
    }

    if(blogId) {
        const result = await SurrealDB.select({ table: "blog", id: blogId})
        return new Response(JSON.stringify({ blog: result}), { status: 200 });
    }


    return new Response(JSON.stringify({ error: "Blog not found" }), { status: 404 });
}

export const POST: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {

        const title = event.url.searchParams.get("title") || undefined;
        const description = event.url.searchParams.get("description") || undefined;
        const titleImageId = event.url.searchParams.get("titleImageId") || undefined;

        if(!title) {
            return new Response(JSON.stringify({ error: "Invalid Params" }), { status: 400 })
        }

        if(titleImageId) {
            const dbImage = await SurrealDB.select({table: "images", id: titleImageId });
            if(!dbImage.length) {
                return new Response(JSON.stringify({ error: "Image not found" }), { status: 400 })
            }
        }

        const newBlogPost = BlogPost.createNewBlogPost({
            title: title,
            authorId: dbUser.getId(),
            description: description,
            titleImageId: titleImageId
        })

        const dbResult = await BlogService.createBlogPost(newBlogPost);

        if(!dbResult.length) {
            return new Response(JSON.stringify({ error: "Failed to create new blogpost" }), { status: 500 })
        }

        return new Response(JSON.stringify({ blogpost: newBlogPost }), { status: 201 });

    } catch(error) {
        if(dev) console.error("Error creating new BlogPost", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

export const DELETE: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const blogPostId = event.url.searchParams.get("blogPostId");

    if(!blogPostId) return new Response(JSON.stringify({ error: "Blog not found" }), { status: 200 })

    const result = await BlogService.deleteBlogPost(blogPostId, dbUser.getId());

    return new Response(JSON.stringify({ message: result }), { status: 200 })
}

// export const PUT: RequestHandler = async (event) => {
//     console.log("[API/BLOG] UPDATE BLOG");

//     const session = await event.locals.auth();

//     if (!session || !session.user) {
//         throw redirect(303, "/signin");
//     }

//     // Get User
//     const user = session.user;
//     const dbUser = User.fromDbRecord(await SurrealDB.selectByProperty("user", "email", user.email))
    

//     // Check if user exists
//     if(!dbUser) {
//         throw redirect(303, "/");
//     }

//     const { createVersion, updateVersion,  } = await event.request.json();

//     // Fetch corresponding Blog
//     const blogPost = await SurrealDB.selectByProperty("blog", "id", updateVersion.blogPostId)

//     // Check and update versions
//     if(createVersion) {
//         console.log("[API/BLOG] CREATE VERSION");
        
//         // Update Blogpost
//         await BlogService.addVersion(dbUser.getId(), createVersion); 

//         // Refetch updated blog
//         const updatedBlogPost = await SurrealDB.selectByProperty("blog", "id", createVersion.blogPostId)

//         return json({ message: "Success", updatedBlog: updatedBlogPost}, { status: 201 })

//     } else if(updateVersion) {
//         console.log("[API/BLOG] UPDATE VERSION");

//         // Update Blogpost
//         await BlogService.updateVersion(dbUser.getId(), updateVersion);

//         // Refetch updated blog
//         const updatedBlogPost = await SurrealDB.selectByProperty("blog", "id", updateVersion.blogPostId)

//         return json({ message: "Success", updatedBlog: updatedBlogPost}, { status: 201 })

//     }

//     // Verify Update as valid version
//     const updatedBlog = undefined;


//     return json({ message: "Success", updatedBlog: updatedBlog}, { status: 201 })

// }

// export const DELETE: RequestHandler = async (event) => {
//     console.log("[API/BLOG] DELETE BLOG/DELETE VERSION");

//     const session = await event.locals.auth();

//     if (!session || !session.user) {
//         throw redirect(303, "/signin");
//     }

//     // Get User
//     const user = session.user;
//     const dbUser = User.fromDbRecord(await SurrealDB.selectByProperty("user", "email", user.email))
    
//     // Check if user exists
//     if(!dbUser) {
//         throw redirect(303, "/");
//     }

//     const {blogPostId, versionId } = await event.request.json();

//     // Delete entire blogpost
//     if(!versionId && blogPostId) {
//         console.log(`[API/BLOG] DELETE BLOGPOST ${blogPostId}`);

//         const result = await BlogService.deleteBlogPost(blogPostId)

//         if(!result) {
//             return json({ message: "Error deleting BlogPost"}, { status: 500 });
//         }

//         const updatedBlogPost = await SurrealDB.selectByProperty("blog", "id", blogPostId)

//         return json({ message: "Blogpost deleted",  updatedBlog: updatedBlogPost} , { status: 200})

//     } else if(versionId && blogPostId) {
//         // Delete a specific Version
//         console.log(`[API/BLOG] DELETE VERSION ${versionId}`);
//         const result = await BlogService.deleteVersion(dbUser.getId(), blogPostId, versionId);

//         if(!result) {
//             return json({ message: "Error deleting Version"}, { status: 500 });
//         }

//         const updatedBlogPost = await SurrealDB.selectByProperty("blog", "id", blogPostId)

//         return json({ message: "Version deleted",  updatedBlog: updatedBlogPost} , { status: 200})
//     } else {
//         return json({ message: "Missing ids"} , {status: 400})
//     }


// }