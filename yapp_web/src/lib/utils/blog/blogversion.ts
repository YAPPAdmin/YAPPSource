import {v4 as uuidv4} from "uuid";
import type { BlogPost } from "./blog";
import type { Operation } from 'fast-json-patch';
import pkg, { deepClone } from 'fast-json-patch';
const { compare } = pkg;

/**
 * Intenal Editor Only Version data
 * (e.g "New Draft - fixing typo")
 */
export type EditorData = {
    title: string,
    description?: string,
}

/**
 * User visible blogpost data 
 */
export type VersionData = {
    title: string,
    description?: string,
    titleImageId?: string,
    content: any,
    metadata: {
        category?: string,
        tags?: string[],
    },
}

export type VersionDraft = {
    id: string,
    blogPostId: string,
    versionId: string,
    authorId: string,
    editorData: EditorData,
    versionData: VersionData,
    lastEdited?: Date,
    isMainVersion: boolean;
    isPublicVersion: boolean;
}

export type ChangeLogEntry = {
    id: string,
    changeDate: Date,
    changeAuthorId: string,
    changes: {
        editorData?: EditorData,
        isMainVersion?: boolean,
        isPublicVersion?: boolean,
        patch?: Operation[];
    },
    changeMessage?: string,
}

export type Revision = {
    id: string,
    changeDate: Date;
    authorId: string;
    action: "create" | "update" | "restore";
    changeMessage?: string;

    changedAreas: string[];
    snapshot: {
        versionData: VersionData;
        editorData: EditorData;
    }
}

export class BlogPostVersion {
    constructor(
        public id: string,
        public isMainVersion: boolean,
        public isPublicVersion: boolean,
        public versionNumber: number,
        public blogPostId: string,
        public authorId: string,
        public creationDate: Date,
        public lastChangeDate: Date,
        
        public drafts: VersionDraft[],
        public EditorData: EditorData, // Editor Only Meta data, non public
        public versionData: VersionData, // Public Blogpost data
        
        public revisions: Revision[],
    ) { }

    /**
     * Rehydrates raw database objects into BlogPostVersions
     * @param record db record
     * @returns 
     */
    static fromDbRecord(record: any) {
        return new BlogPostVersion(
            record.id,
            record.isMainVersion || false,
            record.isPublicVersion || false,
            record.versionNumber || 1,
            record.blogPostId,
            record.authorId,
            new Date(record.creationDate),
            new Date(record.lastChangeDate),
            record.drafts || [],
            record.EditorData,
            record.versionData,
            record.revisions || []
        );
    }

    static sanitize() {
        const clone = JSON.parse(JSON.stringify(this));

        const publicVersions = clone.versions.filter((version: any) => version.isPublicVersion);

    }

    /**
     * Creates a new Version
     * Priority order for parameters: overrides > previousVersion > blogPost > defaults/empty
     * @param authorId: Author ID of the Version author
     * @param blogPost (optional): BlogPost to base Version on
     * @param previousVersion (optional): Previous Version to base Version on
     * @param overrides (optional): Specific overrides
     * @returns 
     */
    static create(
        authorId: string,
        blogPost?: BlogPost, 
        previousVersion?: BlogPostVersion,
        overrides?: {
            EditorData?: EditorData,
            versionData?: VersionData,
        }, 
        changeMessage?: string,
    ): BlogPostVersion {

        let nextVersionNumber = 1;
        if(blogPost && blogPost.versions && blogPost.versions.length > 0) {
            const existingNumbers = blogPost.versions.map(version => version.versionNumber);
            const maxVersion = Math.max(...existingNumbers);
            nextVersionNumber = maxVersion + 1;
        }

        const versionData: VersionData = {
            title: overrides?.versionData?.title
                ?? previousVersion?.versionData.title
                ?? blogPost?.title
                ?? "New Blogpost",
            
            description: overrides?.versionData?.description
                ?? previousVersion?.versionData.description
                ?? blogPost?.description
                ?? "",

            titleImageId: overrides?.versionData?.titleImageId
                ?? previousVersion?.versionData.titleImageId
                ?? blogPost?.titleImageId
                ?? "",
            
            content: overrides?.versionData?.content
                ?? previousVersion?.versionData.content
                ?? {},

            metadata: {
                category: overrides?.versionData?.metadata.category
                    ?? previousVersion?.versionData.metadata.category
                    ?? blogPost?.category
                    ?? "",

                tags: overrides?.versionData?.metadata.tags 
                    ?? previousVersion?.versionData.metadata.tags
                    ?? blogPost?.tags
                    ?? []
            }
        }

        const EditorData: EditorData = {
            title: overrides?.EditorData?.title
                ?? (previousVersion?.EditorData.title ? `Copy of ${previousVersion.EditorData.title}` : null)
                ?? (blogPost?.title ? `New "${blogPost.title}" Version` : null)
                ?? "New Version",

            description: overrides?.EditorData?.description 
                ?? previousVersion?.EditorData.description
                ?? blogPost?.description
                ?? ""
        }

        const newBlogPostVersion = new BlogPostVersion(
            uuidv4().replace(/-/g, ""),     
            false,                          // isMainVersion
            false,                          // isPublicVersion
            nextVersionNumber,              // Version Number
            blogPost?.id || "",                  
            authorId,    
            new Date(),
            new Date(),
            [],                             // Drafts
            EditorData,
            versionData,
            [],
        );

        // newBlogPostVersion.addChangeLogEntry(authorId, "Creation", EditorData, versionData)
        const creationMessage = `Created new Version (${newBlogPostVersion.versionNumber}) for ${blogPost?.title}`
        newBlogPostVersion.addRevision(authorId, EditorData, versionData, creationMessage, "create")

        return newBlogPostVersion
    }

    /**
     * Updates a version with a new version
     * @param authorId authorId
     * @param updatedVersion updatedVersion
     * @param changeMessage changeMessage
     * @returns The updated BlogPostVersion
     */
    public update(authorId: string, updatedVersion: BlogPostVersion, changeMessage: string = "", action: "update" | "restore" = "update"): BlogPostVersion {

        this.lastChangeDate = new Date();

        // Fallback data
        const newEditorData = updatedVersion.EditorData || this.EditorData;
        const newVersionData = updatedVersion.versionData || this.versionData;
        const newIsMain = updatedVersion.isMainVersion ?? this.isMainVersion;
        const newIsPublic = updatedVersion.isPublicVersion ?? this.isPublicVersion;

        this.addRevision(authorId, newEditorData,  newVersionData, newIsPublic, newIsMain, changeMessage, action)

        // Update Data
        this.EditorData = newEditorData;
        this.versionData = newVersionData;
        this.isMainVersion = newIsMain;
        this.isPublicVersion = newIsPublic;

        // Delete draft by user
        this.deleteDraft(authorId)

        return this;
    }

    public addRevision(authorId: string, newEditorData: EditorData, newVersionData: VersionData, newIsPublic: boolean, newIsMain: boolean, message: string, action: "create" | "update" | "restore") {
        const diffPatch = compare({ versionData: this.versionData }, { versionData: newVersionData });

        const changedAreas = new Set<string>();
        diffPatch.forEach(op => {
            if (op.path.includes('/content')) changedAreas.add('Content');
            if (op.path.includes('/title')) changedAreas.add('Title');
            if (op.path.includes('/description')) changedAreas.add('Description');
        });

        if (this.isPublicVersion !== newIsPublic) changedAreas.add('Visibility Status');
        if (this.isMainVersion !== newIsMain) changedAreas.add('Main Status');

        const newRevision: Revision = {
            id: uuidv4().replace(/-/g, ""),
            changeDate: new Date(),
            authorId: authorId,
            changeMessage: message,
            action: action,
            changedAreas: Array.from(changedAreas),
            
            snapshot: {
                versionData: deepClone(newVersionData),
                editorData: deepClone(newEditorData)
            }
        };

        this.revisions.push(newRevision);
        if(this.revisions.length > 30) this.revisions.shift()
    }

    /**
     * @deprecated Replaced by addRevision
     * Adds a change log entry to the changeLogEntry list
     * @param authorId Update Author
     * @param newEditorData newEditorData
     * @param newVersionData newVersionData
     * @param message Update Message
     * @param isMainVersion isMainVersion
     * @param isPublicVersion isPublicVersion
     */
    public addChangeLogEntry(
        authorId: string,
        newEditorData: EditorData,
        newVersionData: VersionData,
        message?: string,
        isMainVersion?: boolean, 
        isPublicVersion?: boolean
    ) {
        const oldState = { versionData: this.versionData};
        const newState = { versionData: newVersionData };

        const diffPatch = compare(oldState, newState);

        const newLog: ChangeLogEntry = {
            id: uuidv4().replace(/-/g, ""),
            changeDate: new Date(),
            changeAuthorId: authorId,
            changeMessage: message,
            changes: {
                editorData: newEditorData,
                isMainVersion: isMainVersion || false, 
                isPublicVersion: isPublicVersion || false,
                patch: diffPatch 
            }
        }

        this.changeLog.push(newLog)

        // Keep at cap
        if(this.changeLog.length > 50) this.changeLog.shift()
    }
 
    //#region Drafts

    /**
     * Gets a spcific draft from the versions draft list by its authorID
     * @param authorId 
     * @returns 
     */
    public getDraft(authorId: string): VersionDraft | undefined {
        return this.drafts.find(draft => draft.authorId == authorId)
    }

    /**
     * Adds a draft to a version by overwriting already existing drafts by that user
     * @param newDraft Draft
     */
    public saveDraft(newDraft: VersionDraft): BlogPostVersion {
        newDraft.lastEdited = new Date();

        // Check if user already has a draft
        const existingINdex = this.drafts.findIndex(draft => draft.authorId == newDraft.authorId);

        if(existingINdex != -1) {
            this.drafts[existingINdex] = newDraft;
        } else {
            this.drafts.push(newDraft)
        }
        return this
    }

    /**
     * Removes a draft associated with a specific author.
     * @param authorId authorId
     */
    public deleteDraft(authorId: string): BlogPostVersion {
        this.drafts = this.drafts.filter(draft => draft.authorId !== authorId);
        return this
    }

    //#endregion

}