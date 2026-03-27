import { v4 as uuidv4 } from "uuid";
import { PageLayoutVersion, type PageLayoutDraft } from "./PageLayoutVersion";
import { PageLayout, PageLayoutRegEntry } from "./PageLayout";
import { SurrealDB } from "$lib/database/newSurrealDB";

export class PageRegistryService {
    static async readPageRegistry(): Promise<PageLayoutRegEntry[]> {
        const pageRegistry = await SurrealDB.select({ table: "pagereg"});
        return pageRegistry;
    }

    static async addToReg(page: PageLayout, titleImageId: string) {
        const registryEntry = new PageLayoutRegEntry(
            page.id,
            page.authorId,
            page.title,
            page.page,
            page.isPublic,
            page.creationDate,
            page.lastEdited,
            titleImageId,
        );

        try {
            const result = await SurrealDB.create({ table: "pagereg", data: registryEntry });
            return result;
        } catch (error) {
            console.error("[PAGEREGISTRY] Failed to add to registry", error);
            return null;
        }
    }

    static async updateReg() {
        return;
    }

    static async removeFromReg() {

    }
}

export class PageService {
    static async getPage(id?: string): Promise<PageLayout[]> {
        try {   
            if(!id) return [];

            const idString = String(id);
            const cleanId = idString.startsWith("page:") ? idString : `page:${idString}`;

            const result = await SurrealDB.select({
                table: "page",
                id: cleanId,
            })

            if (!result || result.length === 0) return [];
            
            return result;

        } catch (error) {
            console.error(`[PAGESERVICE] Failed to fetch page ${id}:`, error);
            return [];
        }
    }

    static async getPageForSlug(slug?: string): Promise<PageLayout | undefined> {
        try {
            const targetSlug = slug || "/";

            const records = await SurrealDB.select({
                table: "page",
                filter: { page: targetSlug },
                limit: 1
            })

            if(!records || records.length == 0) {
                console.error("No page found for slug: ", slug);
                return undefined;
            }

            return PageLayout.fromDbRecord(records[0])
        } catch (error) {
            console.error(`[PAGESERVICE] Failed to fetch page for slug "${slug}":`, error);
            return undefined;
        }
    }

    static async createPage(data: { title: string, description: string, slug: string, titleImageId: string, authorId: string }) {
        const now = new Date();

        const newPageLayout = new PageLayout(
            uuidv4().replace(/-/g, ""),
            data.authorId,
            data.title,
            data.description,
            data.slug,
            false,
            [],
            [],
            [],
            "", 
            undefined,
            now,
            now,
            [],
        )

        const initialVersion = new PageLayoutVersion(
            uuidv4().replace(/-/g, ""),
            newPageLayout.id,
            data.authorId,
            data.title,
            data.description,
            "Initial Version",
            "A new Page",
            1,
            true,
            [],
            { metaTitle: data.title, metaDescription: data.description },
            "default",
            now, 
            now,
            [],
        )

        newPageLayout.mainVersion = initialVersion;
        newPageLayout.mainVersionId = initialVersion.id;
        newPageLayout.versions.push(initialVersion)

        try {
            const dbResult = await SurrealDB.create({ table: "page", data: newPageLayout })

            if (!dbResult || dbResult.length === 0) {
                console.error("[PAGESERVICE] Error creating page in DB");
                return undefined;
            }

            await PageRegistryService.addToReg(newPageLayout, data.titleImageId);
            
            return dbResult[0]

        } catch (error) {
            console.error("[PAGESERVICE] Fatal Exception creating page:", error);
            return undefined;
        }

    }

    static async updatePage() {
        return;
    }

    static async deletePage() {
        return;
    }

    static async addVersion(authorId: string, newVersion: PageLayoutVersion) {
        const dbPageLayout = await PageService.getPage(newVersion.pageLayoutId)

        if(!dbPageLayout || dbPageLayout.length == 0) {
            console.error("Base dbPageLayout not found")
            return;
        }

        const pageLayout = PageLayout.fromDbRecord(dbPageLayout[0]);
        if(!pageLayout) {
            console.error("Failed to parse page layout in addVersion");
            return;
        }

        let setActive = false;
        if(newVersion.isMainVersion) {
            setActive = true;
            if(pageLayout.versions?.length) {
                const oldActiveVersion = pageLayout.versions.find(version => version.isMainVersion == true);
                if(oldActiveVersion) {
                    oldActiveVersion.isMainVersion = false;
                }

                pageLayout.mainVersion = newVersion;
                pageLayout.mainVersionId = newVersion.id;
            }
        }

        pageLayout.versions ??= [];
        pageLayout.versions.push(newVersion);
        pageLayout.lastEdited = new Date();

        const dbResult = await SurrealDB.update(pageLayout, authorId);
        console.log(dbResult);

        if(!dbResult) {
            console.log("[PAGELAYOUT/ADDVERSION] Error updating Version in DB")
            return;
        }

        return PageLayout.fromDbRecord(dbResult[0])
    }

    static async updateVersion(authorId: string, newVersion: PageLayoutVersion, changeMessage?: string): Promise<PageLayout|undefined> {
        try {
            // Find corresponding PageLayout
            const pageLayoutList = await PageService.getPage(newVersion.pageLayoutId)
            const pageLayout = PageLayout.fromDbRecord(pageLayoutList[0])
            if(!pageLayout) {
                return undefined;
            }

            // Find Version
            const version = pageLayout.getVersion(newVersion.id)

            if(!version) {
                console.warn(`[PAGESERVICE/UPDATEVERSION] Could not find version ${newVersion.id} inside PageLayout.`);
                return undefined;
            }

            // Update Version
            const updatedVersion = version.update(authorId, newVersion, changeMessage)

            if(!updatedVersion) {
                console.warn(`[PAGESERVICE/UPDATEVERSION] Could not find version ${updatedVersion.id} inside PageLayout.`);
                return undefined;
            }

            // Return Version to pageLayout
            pageLayout.updateVersion(updatedVersion)

            if(updatedVersion.isMainVersion && pageLayout.versions) {
                pageLayout.versions.forEach(version => {
                    if(version.id != updatedVersion.id) {
                        version.isMainVersion = false;
                    }
                })

                pageLayout.mainVersion = updatedVersion;
            }

            const dbResult = await SurrealDB.update(pageLayout);
            console.log("RAW DB RESULT:", dbResult[0]);

            if (!dbResult || dbResult.length === 0) {
                console.error("[PAGESERVICE/UPDATEVERSION] Error updating Version in DB");
                return undefined;
            }

            console.log(dbResult[0])
            const formated = PageLayout.fromDbRecord(dbResult[0])
            return formated

        } catch (error) {
            console.error("[PAGESERVICE/UPDATEVERSION] Fatal Exception:", error);
            return undefined;
        }
    }

    static async saveDraft(draft: PageLayoutDraft, userId: string): Promise<PageLayoutVersion[]> {
        // Throw on missing draft
        if(!draft) throw new Error("Invalid draft");

        // Try to find coresponding blogpost
        const pageLayoutList = await PageService.getPage(draft.pageLayoutId);
        const pageLayout = pageLayoutList[0];

        if(!pageLayout) throw new Error("PageLayout not found");

        const version = pageLayout.getVersion(draft.pageLayoutVersionId);

        if(!version) throw new Error("Version not found");

        version.saveDraft(draft);

        pageLayout.updateVersion(version);

        const result = await SurrealDB.update(pageLayout, userId);
        return result;
    }

    static async deleteDraft(pageLayoutId: string, versionId: string, authorId: string): Promise<PageLayout> {
        if(!pageLayoutId || !versionId || !authorId) throw new Error("Missing parameters");

        // Try to find coresponding blogpost
        const pageLayoutList = await PageService.getPage(pageLayoutId);
        const pageLayout = pageLayoutList[0];

        if(!pageLayout) throw new Error("PageLayout not found");

        const version = pageLayout.getVersion(versionId);

        if(!version) throw new Error("Version not found"); 

        version.deleteDraft(authorId);

        pageLayout.updateVersion(version);

        const result = await SurrealDB.update(pageLayout, authorId);
        return result;
        
    }
}

