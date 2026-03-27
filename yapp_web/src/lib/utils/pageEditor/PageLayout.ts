import type { CustomTheme } from "../style/pagestyle";
import { PageLayoutVersion } from "./PageLayoutVersion";

export class PageLayoutRegEntry {
    constructor(
        public id: string,
        public authorId: string,
        public title: string,
        public slug: string,
        public isPublic: boolean,
        public creationDate: Date,
        public lastEdited: Date,
        public thumbnailImageId: string,
    ) {}
}

export class PageLayout {
    constructor(
        public id: string,
        public authorId: string,
        public title: string,
        public description: string,
        public page: string,
        public isPublic: boolean,

        public lightThemes: CustomTheme[],
        public darkThemes: CustomTheme[],
        
        public versions: PageLayoutVersion[],
        public mainVersionId: string,
        public mainVersion: PageLayoutVersion | undefined,

        public creationDate: Date,
        public lastEdited: Date,
        public changeLog: any[],
    ) { }

    static fromDbRecord(record: any): PageLayout | undefined {
        if (!record) return undefined;

        try {
            let parsedVersions: PageLayoutVersion[] = [];
            if (Array.isArray(record.versions)) {
                parsedVersions = record.versions
                    .map((version: any) => PageLayoutVersion.fromDbRecord(version))
                    .filter((version: any): version is PageLayoutVersion => version !== undefined);
            }

            const parsedMainVersion = record.mainVersion 
                ? PageLayoutVersion.fromDbRecord(record.mainVersion) 
                : undefined;

            let formatedId: string;

            if(record.id && typeof record.id == "object" && "tb" in record.id && "id" in record.id) {
                formatedId = `${record.id.tb}:${record.id.id}`;
            } else if(typeof record.id == "string") {
                formatedId = record.id;
            } else {
                throw new Error(`Invalid record.id format: ${JSON.stringify(record)}`);
            }

            record.id = formatedId;
            
            return new PageLayout(
                record.id,
                record.authorId,
                record.title || "",
                record.description || "",
                record.slug || record.page || "", 
                record.isPublic ?? false,
                record.lightThemes || [],
                record.darkThemes || [],
                parsedVersions,
                record.mainVersionId || "",
                parsedMainVersion as PageLayoutVersion, 
                new Date(record.creationDate),
                record.lastEdited ? new Date(record.lastEdited) : new Date(record.creationDate),
                record.changeLog || []
            );
        } catch (error) {
            console.error(`[PageLayout] Failed to parse DB record ${record?.id}:`, error);
            console.error(error)
            return undefined;
        }
    }

    /**
     * Gets a spcific version from the versions list by its id
     * If no id is provided, it returns the version with the highest version number
     * @param versionId The id of the version to get
     * @returns The matching PageLayoutVersion or undefined
     */
    getVersion(versionId: string | "latest"): PageLayoutVersion | undefined {
        if(!this.versions || this.versions.length == 0) {
            return undefined;
        }

        if (versionId && versionId !== "latest") {
            return this.versions.find(version => version.id === versionId);
        }

        return this.versions.reduce((latest, current) => {
            return (current.versionNumber > latest.versionNumber) ? current : latest;
        });
    }

    updateVersion(udpatedVersion: PageLayoutVersion): PageLayout | undefined {
        if(!this.versions || udpatedVersion) return;

        // Find version
        const index = this.versions.findIndex(version => version.id == udpatedVersion.id);

        if(index == -1) {
            return;
        }

        this.versions[index] = udpatedVersion;
        return this;
    }

    deleteVersion(versionId: string): boolean {
        if(!this.versions || this.versions.length == 0) return false;

        if(this.versions.length == 1 && this.versions[0].id == versionId) {
            throw new Error("Cannot delete last remaning version");
        }

        const initialLength = this.versions.length;
        this.versions = this.versions.filter(version => version.id != versionId);
        return this.versions.length < initialLength;
    }
}