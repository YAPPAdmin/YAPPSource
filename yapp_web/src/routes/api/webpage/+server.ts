import { Layout, type LayoutSchemas, type MetaData } from "$lib/customRenderer/customRendere";
import { LayoutService } from "$lib/customRenderer/layoutUtilsSS";
import { UserService } from "$lib/utils/authUtilsSS";
import { Logger } from "$lib/utils/logger";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const id = event.url.searchParams.get('id');
    const onlyReg = event.url.searchParams.get("onlyReg");

    if(onlyReg) {
        const layoutReg = await LayoutService.getLayoutRegistry();
        return new Response(JSON.stringify({message: layoutReg}), { status: 200 });
    }

    if(!id) return new Response(JSON.stringify({error: "Layout not found"}), { status: 404 });

    const layout = await LayoutService.getLayout(id);

    console.log("API: ", layout)

    if(!layout) return new Response(JSON.stringify({error: "Layout not found"}), { status: 404 });

    return new Response(JSON.stringify({message: layout}), { status: 200 })
}

export const POST: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    try {
        if (!session?.user || !dbUser) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        const body = await event.request.json();
        const { name, type } = body;

        if(!name || typeof name != "string" || !type || typeof type != "string") {
            return new Response(JSON.stringify({error: "Missing Parameter"}), { status: 400 });
        }

        // Generate new Layout
        const newLayout = Layout.generateLayout(dbUser.getId(), name, type);

        // Save new Layout
        const result = await LayoutService.saveLayout(newLayout, dbUser)
        
        if(!result) {
            return new Response(JSON.stringify({error: "Error saving to DB"}), { status: 500 });
        }

        return new Response(JSON.stringify({message: "Successfully created new Layout", result: result}), { status: 201 });

    } catch (err) {
        console.error("Error saving layout:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};

export const PUT: RequestHandler = async (event) => {

    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)
    let updatedLayout;

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }
    
    try{
        const body = await event.request.json();
        
        const existingLayout = await LayoutService.getLayout(body.id);
        if (!existingLayout) {
            return new Response(JSON.stringify({ error: "Layout not found" }), { status: 404 });
        }

        // Only allow the author to update their layout
        if (existingLayout.authorId !== dbUser.getId()) {
            return new Response(JSON.stringify({ error: "Forbidden: not your layout" }), { status: 403 });
        }

        if (!body?.id) {
            return new Response(JSON.stringify({ error: "Missing layout ID" }), { status: 400 });
        }

        updatedLayout = Layout.fromJSON(body);

        // Update timestamp
        updatedLayout.metadata.lastUpdated = new Date();

        const result = await LayoutService.saveLayout(updatedLayout, dbUser);

        if (!result) {
            return new Response(JSON.stringify({ error: "Failed to save layout" }), { status: 500 });
        }

        return new Response(JSON.stringify({result: updatedLayout.toJSON()}), { status: 200 }
        );

    } catch (error) {
        Logger.warn("[API][WEBPAGE]", "Something went wrong updating Layout", String(error), {layoutId: updatedLayout}, {id: dbUser.getId(), email: dbUser.getEmail()});
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}