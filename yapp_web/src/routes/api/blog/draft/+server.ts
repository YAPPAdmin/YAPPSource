import { UserService } from "$lib/utils/auth/UserService";
import { BlogService } from "$lib/utils/blog/blogUtilsSS";
import { type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {
        const draft = await event.request.json();

        const updatedVersion = await BlogService.saveDraft(draft, dbUser.getId());

        return new Response(JSON.stringify({message: "Draft saved successfully", version: updatedVersion }), { status: 200 });

    } catch (error: any) {
        console.error("Draft save error:", error);
        return new Response(JSON.stringify({error: error }), { status: 500 });
    }

}


