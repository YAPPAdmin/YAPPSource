import {v4 as uuidv4} from "uuid";
import type { PageLayout } from "./PageLayout";
import type { BlockNode } from "../../svelteComponents/homepage/utils/blocks";
import { deepClone } from "fast-json-patch";

export interface PageSEO {
    metaTitle: string;
    metaDescription: string;
    ogImageId?: string;
    keywords?: string[];
}

export type PageLayoutDraft = {
    id: string,
    authorId: string,
    pageLayoutId: string,
    pageLayoutVersionId: string,
    title: string,
    description: string,
    blocks: BlockNode[],
    seo: PageSEO,
    creationDate: Date,
    lastEdit: Date,
}

export class PageLayoutVersion {
    constructor(
        public id: string,
        public pageLayoutId: string,
        public authorId: string,
        public title: string,
        public description: string,
        public versionTitle: string,
        public versionDescription: string,
        public versionNumber: number,

        public isMainVersion: boolean,

        public blocks: BlockNode[],
        public seo: PageSEO,
        public activeThemeId: string,

        public creationDate: Date,
        public lastEdit: Date,
        public revisions: any[],
        public drafts: PageLayoutDraft[],
    ) { }

    static create(
        authorId: string,
        pageLayout: PageLayout,
        overrides: {
            title?: string;
            description?: string;
            versionTitle?: string;
            versionDescription?: string;
            blocks?: BlockNode[];
            seo?: PageSEO;
        } = {},
        previousVersion?: PageLayoutVersion,
    ) {
        let nextVersionNumber = 1;
        if(pageLayout && pageLayout.versions && pageLayout.versions.length > 0) {
            const existingNumbers = pageLayout.versions.map(version => version.versionNumber);
            const maxVersion = Math.max(...existingNumbers);
            nextVersionNumber = maxVersion +1;
        }

        const now = new Date();

        const title = overrides.title 
            || (previousVersion ? `Copy of ${previousVersion.title}` : `Copy of ${pageLayout.title}`);
            
        const description = overrides.description 
            || previousVersion?.description 
            || pageLayout.description 
            || "";

        const versionTitle = overrides.versionTitle 
            || `Version ${nextVersionNumber}`;

        const versionDescription = overrides.versionDescription 
            || "";

        const activeThemeId = previousVersion?.activeThemeId || "default";

        const blocks: BlockNode[] = overrides.blocks 
            ? overrides.blocks 
            : (previousVersion?.blocks ? JSON.parse(JSON.stringify(previousVersion.blocks)) : []);

        const seo: PageSEO = overrides.seo 
            ? overrides.seo 
            : (previousVersion?.seo ? JSON.parse(JSON.stringify(previousVersion.seo)) : { metaTitle: title, metaDescription: description });

        const newVersion = new PageLayoutVersion(
            uuidv4().replace(/-/g, ""), 
            pageLayout.id,
            authorId,
            title,
            description,
            versionTitle,
            versionDescription,
            nextVersionNumber,
            false,
            blocks,
            seo,
            activeThemeId,
            now,
            now,
            [],
            [],
        )
        return newVersion;
    }

    public update(authorId: string, updatedVersion: PageLayoutVersion, changeMessage: string = "", action : "update" | "restore" = "update") {
        this.lastEdit = new Date();

        // Fallback data
        const newIsMain = updatedVersion.isMainVersion ?? this.isMainVersion;
        const newSEO = updatedVersion.seo ?? this.seo;
        const newActiveThemeId = updatedVersion.activeThemeId ?? this.activeThemeId;
        const newVersionDescription = updatedVersion.versionDescription ?? this.versionDescription;
        const newVersionTitle = updatedVersion.versionTitle ?? this.versionTitle;
        const newTitle = updatedVersion.title ?? this.title;
        const newDescription = updatedVersion.description ?? this.description;
        const newBlocks = updatedVersion.blocks ?? this.blocks;

        this.addRevision(authorId, updatedVersion, changeMessage, action);

        // Update Data
        this.isMainVersion = newIsMain;
        this.seo = newSEO;
        this.activeThemeId = newActiveThemeId;
        this.versionDescription = newVersionDescription;
        this.versionTitle = newVersionTitle;
        this.title = newTitle;
        this.description = newDescription;
        this.blocks = newBlocks;

        // Delete draft by user
        this.deleteDraft(authorId)

        return this;
    }

    public addRevision(authorId: string, updatedVersion: PageLayoutVersion, message: string, action: "create" | "update" | "restore") {
        const changedAreas = new Set<string>();

        if (JSON.stringify(this.blocks) !== JSON.stringify(updatedVersion.blocks)) changedAreas.add('Content Blocks');
        if (this.title !== updatedVersion.title) changedAreas.add('Title');
        if (this.description !== updatedVersion.description) changedAreas.add('Description');
        if (JSON.stringify(this.seo) !== JSON.stringify(updatedVersion.seo)) changedAreas.add('SEO Settings');
        if (this.activeThemeId !== updatedVersion.activeThemeId) changedAreas.add('Theme');
        if (this.isMainVersion !== updatedVersion.isMainVersion) changedAreas.add('Main Status');
    
        const newRevision = {
            id: uuidv4().replace(/-/g, ""),
            changeDate: new Date(),
            authorId: authorId,
            changeMessage: message,
            action: action,
            changedAreas: Array.from(changedAreas),
            snapshot: {
                title: updatedVersion.title ?? this.title,
                description: updatedVersion.description ?? this.description,
                blocks: deepClone(updatedVersion.blocks ?? this.blocks),
                seo: deepClone(updatedVersion.seo ?? this.seo),
                activeThemeId: updatedVersion.activeThemeId ?? this.activeThemeId,
                versionTitle: updatedVersion.versionTitle ?? this.versionTitle,
                versionDescription: updatedVersion.versionDescription ?? this.versionDescription
            }
        };

        if (!this.revisions) this.revisions = [];
        this.revisions.push(newRevision);
        
        if (this.revisions.length > 30) {
            this.revisions.shift();
        }
    }

    static fromDbRecord(record: any): PageLayoutVersion | undefined {
        if (!record) return undefined;

        try {
            return new PageLayoutVersion(
                record.id,
                record.pageLayoutId,
                record.authorId,
                record.title || "",
                record.description || "",
                record.versionTitle || "Untitled Version",
                record.versionDescription || "",
                record.versionNumber || 1,
                record.isMainVersion ?? false,
                record.blocks || [],
                record.seo || { metaTitle: record.title || "", metaDescription: "" },
                record.activeThemeId || "default",
                new Date(record.creationDate),
                record.lastEdit ? new Date(record.lastEdit) : new Date(record.creationDate), 
                record.changeLog || [],
                record.drafts || [],
            );
        } catch (error) {
            console.error(`[PageLayoutVersion] Failed to parse DB record ${record?.id}:`, error);
            console.error(error)
            return undefined;
        }
    }


    public getDraft(authorId: string): PageLayoutDraft | undefined {
        return this.drafts.find(draft => draft.authorId == authorId)
    }

    public saveDraft(newDraft: PageLayoutDraft): PageLayoutVersion {
        newDraft.lastEdit = new Date();

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
    public deleteDraft(authorId: string): PageLayoutVersion {
        this.drafts = this.drafts.filter(draft => draft.authorId !== authorId);
        return this
    }


}