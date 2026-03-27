import type { RequestHandler } from "@sveltejs/kit";
import { UserService } from "$lib/utils/auth/UserService";
import { PageLayout } from "$lib/utils/pageEditor/PageLayout";
import { PageService } from "$lib/utils/pageEditor/PageServiceSS";
import { PageLayoutVersion } from "$lib/utils/pageEditor/PageLayoutVersion";

export const POST: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {
        let body: any = {};
        if (event.request.headers.get('content-type')?.includes('application/json')) {
            body = await event.request.json().catch(() => ({})); 
        }

        const draft = body.draft;
        const changeMessage = body.changeMessage || "";

        const basePageLayoutId = draft?.basePageLayoutId || event.url.searchParams.get("basePageLayoutId");
        const baseVersionId = draft?.versionId || event.url.searchParams.get("baseVersionId");
        const versionTitle = event.url.searchParams.get("versionTitle") || "";
        const versionDescr = event.url.searchParams.get("versionDescr") || "";

        if(!basePageLayoutId) {
            return new Response(JSON.stringify({ error: "Missing Base Page Layout ID" }), { status: 404 });
        }

        // Get Base Page Layout
        let basePageLayoutArray: PageLayout[] = await PageService.getPage(basePageLayoutId);
        if(!basePageLayoutArray.length)return new Response(JSON.stringify({ error: "Base Page Layout not found" }), { status: 400 })
        let basePageLayout = PageLayout.fromDbRecord(basePageLayoutArray[0]);

        // Get Base Version
        let baseVersion;
        console.log("BASE PAGE LAYOUT: ", basePageLayout)
        if(baseVersionId) {
            baseVersion = basePageLayout.getVersion(baseVersionId);
            if(baseVersionId && !baseVersion) return new Response(JSON.stringify({ error: "Base Page Layout Version not found" }), { status: 404 }) 
        }

        const newVersion = PageLayoutVersion.create(
            dbUser.getId(), 
            basePageLayout,
            {
                title: versionTitle,
                description: versionDescr,
                versionTitle: versionTitle,
                versionDescription: versionDescr
            },
            baseVersion
        )

        const updatedPageLayout = await PageService.addVersion(dbUser.getId(), newVersion);

        return new Response(JSON.stringify({ pageLayout: updatedPageLayout }), { status: 200 })
  
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

        console.log("RECIVED DRAFT FOR SAVE: ", draft)

        // Throw on missing draft
        if (!draft || !draft.pageLayoutVersionId || !draft.pageLayoutId) {
            return new Response(JSON.stringify({ error: "Invalid payload: Missing draft or ID data" }), { status: 400 });
        }

        const updatePayload = {
            id: draft.pageLayoutVersionId,
            seo: draft.seo,
            pageLayoutId: draft.pageLayoutId,
            isMainVersion: draft.isMainVersion,
            activeThemeId: draft.activeThemeId,
            versionDescription: draft.versionDescription,
            versionTitle: draft.versionTitle,
            title: draft.title,
            description: draft.description,
            blocks: draft.blocks
        } as any;

        const updatedPageLayout = await PageService.updateVersion(
            dbUser.getId(),
            updatePayload,
            changeMessage,
        )

        if(!updatedPageLayout) {
            return new Response(JSON.stringify({ error: "Failed to update version in database" }), { status: 500 });
        }

        // Return
        return new Response(JSON.stringify({ update: updatedPageLayout }), { status: 200 })
    
    } catch (error) {
        console.error("Endpoint Error - Version Update:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
