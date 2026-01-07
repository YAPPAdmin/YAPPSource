import { dev } from "$app/environment";
import { UserService } from "$lib/utils/auth/UserService";
import { Uploads } from "$lib/utils/uploads";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {

        const id = event.url.searchParams.get("id");
        const fileName = event.url.searchParams.get("fileName");
        const source = event.url.searchParams.get("source");

        const result = await Uploads.getFile(id, fileName, source)

        if (result.length === 0) {
            return new Response(JSON.stringify({ error: "No files found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ files: result }), { status: 200 });
        
    } catch(error) {
        if(dev) console.error("Error getting file", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

export const POST: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {
        const form = await event.request.formData();
        const file = form.get("file") as File | null;

        if(!file) {
            return new Response(JSON.stringify({error: "No file found"}), { status: 400 });
        }

        // Validate type
        if(!file.type.startsWith("image/")) {
            return new Response(JSON.stringify({error: "Invalid Filetype"}), { status: 400 });
        }

        const MAX = 18 * 1024 * 1024;
        if(file.size > MAX) {
            return new Response(JSON.stringify({error: "File to large"}), { status: 400 });
        }

        // Extract Metadata
        const name = (form.get("name") as string)?.trim();
        const description = (form.get("description") as string)?.trim();
        const source = (form.get("source")as string)?.trim();

        const size = file.size;
        const lastModified = file.lastModified; 

        const result = await Uploads.saveFileUpload(file, dbUser.getId(), name, description, source)

        return new Response(JSON.stringify(result), { status: 201 })

    } catch(error) {
        if(dev) console.error("Error uploading file", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

export const PUT: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {

        const id = event.url.searchParams.get("id");

        if (!id) {
            return new Response(JSON.stringify({ error: "Missing file id" }), { status: 400 });
        }

        // Accept JSON updates
        const body = await event.request.json().catch(() => null);

        if (!body || typeof body !== "object") {
            return new Response(JSON.stringify({ error: "Invalid or missing JSON body" }), { status: 400 });
        }

        // Allowed update fields
        const allowedFields = ["name", "description", "source", "fileUrl"];
        const updates: Record<string, any> = {};

        for (const key of allowedFields) {
            if (body[key] !== undefined) updates[key] = body[key];
        }

        if (Object.keys(updates).length === 0) {
            return new Response(JSON.stringify({ error: "No valid fields to update" }), { status: 400 });
        }

        // Perform update
        const result = await Uploads.updateFile(id, {...updates});

        if (!result.success) {
            return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 });
        }

        return new Response(JSON.stringify({ updated: result.updated }), { status: 200 });


    } catch(error) {
        if(dev) console.error("Error updating file", error);
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

    try{

        const id = event.url.searchParams.get("id");

        if(!id) {
            return new Response(JSON.stringify({ error: "No files found" }), { status: 404 });
        }

        const result = await Uploads.deleteFile(id);

        return new Response(JSON.stringify({ delete: result }), { status: 200})

    } catch(error) {
        if(dev) console.error("Error deleting file", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}