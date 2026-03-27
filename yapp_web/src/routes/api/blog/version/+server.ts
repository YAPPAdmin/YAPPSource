
import { BlogPost } from "$lib/utils/blog/blog"
import { BlogService } from "$lib/utils/blog/blogUtilsSS"
import { BlogPostVersion } from "$lib/utils/blog/blogversion"
import { UserService } from "$lib/utils/auth/UserService";
import type { RequestHandler } from "@sveltejs/kit";


export const POST: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {
        // Body
        let body: any = {};
        if (event.request.headers.get('content-type')?.includes('application/json')) {
            body = await event.request.json().catch(() => ({})); 
        }

        const draft = body.draft;
        const changeMessage = body.changeMessage || "";

        const baseBlogPostId = draft?.blogPostId || event.url.searchParams.get("baseBlogPostId");
        const baseVersionId = draft?.versionId || event.url.searchParams.get("baseVersionId");
        const versionTitle = event.url.searchParams.get("versionTitle") || "";
        const versionDescr = event.url.searchParams.get("versionDescr") || "";

        if (!baseBlogPostId) {
            return new Response(JSON.stringify({ error: "Missing Base BlogPost ID" }), { status: 404 });
        }

        // Get Base Blogpost
        let baseBlogPostArray: BlogPost[] = await BlogService.readBlogPost(baseBlogPostId);
        if(!baseBlogPostArray.length) return new Response(JSON.stringify({ error: "Base Blogpost not found" }), { status: 400 })
        let baseBlogPost = baseBlogPostArray[0]

        // Get Base Version
        let baseVersion;
        if(baseVersionId) {
            baseVersion = baseBlogPost.getVersion(baseVersionId);
            if(baseVersionId && !baseVersion) return new Response(JSON.stringify({ error: "Base Blogpost Version not found" }), { status: 404 }) 
        }
        
        // Create Overrides
        let overrides: any = {};
        if(draft) {
            overrides = {
                EditorData: draft.editorData,
                versionData: draft.versionData,
            }
        } else {
            overrides = {
                EditorData: {
                    title: versionTitle,
                    description: versionDescr,
                }
            }
        }

        // Create new Version
        const newVersion = BlogPostVersion.create(dbUser.getId(), baseBlogPost, baseVersion, overrides, changeMessage)
        
        // Store in db
        const dbResult = await BlogService.addVersion(dbUser.getId(), newVersion)

        // Get updated Blogpost
        const updatedBlogPostArray = await BlogService.readBlogPost(baseBlogPost.id);
        const updatedBlogPost = updatedBlogPostArray[0];

        // Return
        return new Response(JSON.stringify({ message: updatedBlogPost }), { status: 200 })

    } catch(error) {
        console.error("Version Creation Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}


export const PUT: RequestHandler = async (event) => {
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email);

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {
        // Get Body
        let body: any = {};
        if (event.request.headers.get('content-type')?.includes('application/json')) {
            body = await event.request.json().catch(() => ({})); 
        }

        const draft = body.draft;
        const changeMessage = body.changeMessage || undefined;

        // Throw on missing draft
        if (!draft || !draft.versionId || !draft.blogPostId) {
            return new Response(JSON.stringify({ error: "Invalid payload: Missing draft or ID data" }), { status: 400 });
        }

        // Transform to update payload
        const updatePayload = {
            id: draft.versionId,           
            blogPostId: draft.blogPostId,
            EditorData: draft.editorData,
            versionData: draft.versionData,
            isMainVersion: draft.isMainVersion,
            isPublicVersion: draft.isPublicVersion,
        } as any; 

        // Update
        const updatedBlogPost = await BlogService.updateVersion(
            dbUser.getId(), 
            updatePayload, 
            changeMessage
        );

        if (!updatedBlogPost) {
            return new Response(JSON.stringify({ error: "Failed to update version in database" }), { status: 500 });
        }

        // Return
        return new Response(JSON.stringify({ message: updatedBlogPost }), { status: 200 })

    } catch (error) {
        console.error("Endpoint Error - Version Update:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

export const DELETE: RequestHandler = async (event) => {
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email);

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {
        const blogPostId = event.url.searchParams.get("blogPostId");
        const versionId = event.url.searchParams.get("versionId");

        if(!blogPostId || !versionId) {
            return new Response(JSON.stringify({ error: "Missing ids" }), { status: 400 });
        }

        const result = await BlogService.deleteVersion(dbUser.getId(), blogPostId, versionId);

        // Get updated Blogpost
        const updatedBlogPostArray = await BlogService.readBlogPost(blogPostId);
        const updatedBlogPost = updatedBlogPostArray[0];

        // Return
        return new Response(JSON.stringify({ message: updatedBlogPost }), { status: 200 })

    } catch(error) {
        console.error("Endpoint Error - Version Delete:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}