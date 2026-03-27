
import { BlogPost } from "./blog";
import type { BlogPostVersion, EditorData, Revision, VersionData, VersionDraft } from "./blogversion";
import { v4 as uuidv4 } from 'uuid';

export type EditorSessionState = {
    versionId: string | null;
    isEditing: boolean;
}

//#region Session Management
export function loadLocalSession(blogPostId: string): EditorSessionState | null {
    const key = `editor_session_${blogPostId}`;
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

export function saveLocalSession(blogPostId: string, versionId: string | null, isEditing: boolean) {
    const key = `editor_session_${blogPostId}`;
    localStorage.setItem(key, JSON.stringify({ versionId, isEditing }))
}
//#endregion

//#region Draft Management
export function createNewDraft(blogPostId: string, version: BlogPostVersion, authorId: string): VersionDraft {
    return {
        id: uuidv4().replace(/-/g, ""),
        blogPostId: blogPostId,
        versionId: version.id,
        authorId: authorId,
        editorData: version.EditorData,
        versionData: version.versionData,
        lastEdited: new Date(),
        isMainVersion: false,
        isPublicVersion: false,
    };
}

export async function saveDraftToServer(draft: VersionDraft) {
    const response = await fetch("/api/blog/draft/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
    })

    if(!response.ok) throw new Error("Failed to save draft to server")
    return true;
}

export async function getRestoredVersionData(revision: Revision): Promise<{versionData: VersionData, editorData: EditorData}> {
    return {
        versionData: JSON.parse(JSON.stringify(revision.snapshot.versionData)),
        editorData: JSON.parse(JSON.stringify(revision.snapshot.editorData)),
    }
        ;
}
// #endregion

//#region Version Management
export async function commitVersion(draft: VersionDraft, saveToNewVersion?: boolean, changeMessage?: string): Promise<BlogPost> {
    const payload = { draft, changeMessage };

    const result = await fetch("/api/blog/version/", {
        method: saveToNewVersion ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if(!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || "Failed to commit version")
    }

    const responseData = await result.json();
    const updatedBlogPost = BlogPost.fromDbRecord(responseData.message);

    if(!updatedBlogPost) throw new Error("Importing BlogPost failed");

    return updatedBlogPost;
}

export async function deleteVersionFromServer(versionId: string) {
    const params = new URLSearchParams({ versionId });
    const response = await fetch(`/api/blog/version?${params.toString()}`, {
        method: "DELETE"
    });
    if(!response.ok) throw new Error("Failed to delete Version");
    return true;
}
//#endregion