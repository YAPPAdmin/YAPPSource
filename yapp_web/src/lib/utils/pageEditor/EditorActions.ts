import { v4 as uuidv4 } from 'uuid';
import type { PageLayoutDraft, PageLayoutVersion } from './PageLayoutVersion';
import { PageLayout } from './PageLayout';

export type EditorSessionState = {
    versionId: string | null;
    isEditing: boolean;
}

export function loadLocalSession(layoutId: string): EditorSessionState | null {
    const key = `editor_session_${layoutId}`;
    const saved = localStorage.getItem(key);

    if(saved) {
        try {
            return JSON.parse(saved)
        } catch(error) {
            console.error("Failed to parse session state")
        }
    }
    return null;
}

export function saveLocalSession(pageLayoutId: string, versionId: string | null, isEditing: boolean) {
    const key = `editor_session_${pageLayoutId}`;
    localStorage.setItem(key, JSON.stringify({ versionId, isEditing }))
}

export function createNewDraft(pageLayoutId: string, version: PageLayoutVersion, authorId: string): PageLayoutDraft {
    const now = new Date()
    
    return {
        id: uuidv4().replace(/-/g, ""),
        authorId: authorId,
        pageLayoutId: pageLayoutId,
        pageLayoutVersionId: version.id,
        title: version.title,
        description: version.description || "",
        blocks: version.blocks || [],
        seo: version.seo || {},
        creationDate: now,
        lastEdit: now,
    };
}

export async function saveDraftToServer(draft: PageLayoutDraft) {
    const response = await fetch("/api/webpage/draft/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
    });

    if(!response.ok) throw new Error("Failed to save draft to server");
    return true;
}

export async function commitVersion(draft: PageLayoutDraft, saveToNewVersion?: boolean, changeMessage?: string): Promise<PageLayout> {
    const payload = { draft, changeMessage };

    const result = await fetch("/api/webpage/version/", {
        method: saveToNewVersion ? "POST" : "PUT",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(payload)
    })

    if(!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || "Failed to commit version")
    }

    const responseData = await result.json();
    const updatedPageLayout = PageLayout.fromDbRecord(responseData.update);

    if(!updatedPageLayout) throw new Error("Importing PageLayout failed");

    return updatedPageLayout;
}

export async function deleteVersionFromServer(versionId: string) {
    const params = new URLSearchParams({ versionId });
    const response = await fetch(`/api/webpage/version?${params.toString()}`, {
        method: "DELETE"
    });
    if(!response.ok) throw new Error("Failed to delete Version");
    return true;
}