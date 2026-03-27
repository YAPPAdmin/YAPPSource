import { v4 as uuidv4 } from 'uuid';
import { BlogPostVersion, type VersionDraft } from './blogversion';


export class BlogRegEntry {
    constructor(
        public id: string,
        public creationDate: Date,
        public authorId: string,
        public title: string,
        public description?: string,
        public titleImageId?: string,
        public metadata?: {
            category?: string,
            tags?: string[],
        }
    ) { }
}


export type ChangeLogEntry = {
    id: string,
    versionId: string,
    timestamp: Date,
    authorId: string;
    action: "create" | "update" | "rollBack";
    description?: string | undefined;
    title?: string | undefined;
    content?: any | undefined;
    public?: boolean;
    active?: boolean;
    error?: {error: boolean|string, errormsg: string|undefined}
}


export class BlogPostShort {
    constructor(
        public id: string,
        public authorId: string
    ) { }
}

export class BlogPost {
    constructor(
        public id: string,
        public creationDate: Date,
        public authorId: string,
        public title: string,
        public description?: string,
        public titleImageId?: string,
        public currentVersion?: string,
        public versions?: BlogPostVersion[],
        public metadata?: {
            category?: string,
            tags?: string[],
        },

        public category?: string,
        public tags?: string[],
        public publicDate?: Date,
        public changeLog?: [],
    ) { }


    /**
     * Factory method to initialize a new BlogPost
     * @param data Initial blogpost data required for creation
     * @param data.title Title
     * @param data.authorId Id of the creating user
     * @param data.description Description
     * @param data.titleImageId Image ID of the title image
     * @param data.metadata.category Category
     * @param data.metadata.tags List of tags
     * @returns A new, initialized BlogPost instance with one empty version
     */
    static createNewBlogPost(data: {
        title: string,
        authorId: string,
        description?: string,
        titleImageId?: string,
        metadata?: {
            category?: string,
            tags?: string[],
        }
    }): BlogPost {

        const blogPost = new BlogPost (
            uuidv4().replace(/-/g, ""),
            new Date(),
            data.authorId,
            data.title,
            data.description || "",
            data.titleImageId || "",

            "",
            [],

            data.metadata,
        )

        const emptyVersion = BlogPostVersion.create(data.authorId, blogPost)
        blogPost.addVersion(emptyVersion);
        blogPost.currentVersion = emptyVersion.id;

        return blogPost;
    }


    //#region Versions
    /**
     * Attaches a set version to this blogpost
     * Versions marked as main version also update main blogpost data
     * @param version The BlogPostVersion object to add
     * @returns The new length of the versions array
     */
    addVersion(version: BlogPostVersion): number {
        if(!this.versions) this.versions = []

        // Handle new main version by updating blog data
        if(version.isMainVersion) {
            this.title = version.versionData.title ?? this.title
            this.description = version.versionData.description ?? this.description
            this.titleImageId = version.versionData.titleImageId ?? this.titleImageId
            this.metadata = version.versionData.metadata ?? this.metadata
        }

        // Attatch version
        return this.versions.push(version)
    }

    /**
     * Gets a spcific version from the versions list by its id
     * If no id is provided, it returns the version with the highest version number
     * @param versionId The id of the version to get
     * @returns The matching BlogPostVersion or undefined
     */
    getVersion(versionId: string | "latest"): BlogPostVersion | undefined {
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

    /**
     * Updates a version entry
     * @param updateVersion Updated Version
     * @returns Updated Blogpost or undefined
     */
    updateVersion(updateVersion: BlogPostVersion): BlogPost | undefined {
        if(!this.versions || !updateVersion) return;

        // Find version
        const index = this.versions.findIndex(version => version.id == updateVersion.id)

        if(index == -1) {
            return;
        }

        this.versions[index] = updateVersion;
        return this
    }

    /**
     * Removes a specific version from the blog post
     * @param versionId 
     * @returns boolean True on succes, false on faliure
     * @throws Error on trying to delete last remanining version
     */
    deleteVersion(versionId: string): boolean {
        if(!this.versions || this.versions.length == 0) return false;

        if(this.versions.length == 1 && this.versions[0].id == versionId) {
            throw new Error("Cannot delete last remaning version");
        }

        const initialLength = this.versions.length;
        this.versions = this.versions.filter(version => version.id != versionId);

        return this.versions.length < initialLength;
    }
    //#endregion

    /**
     * Converts a raw database or json record into a BlogPost instance
     * @param record The raw JSON record
     * @returns A BlogPost instance
     */
    static fromDbRecord(record: any): BlogPost | undefined {
        if(!record) return undefined;

        const hydratedVersions = record.versions
            ? record.versions.map((version: any) => BlogPostVersion.fromDbRecord(version))
            : []

        const blogPost: BlogPost = new BlogPost(
            record.id?.toString(),               // id
            new Date(record.creationDate),      // creationDate
            record.authorId,                    // authorId
            record.title,                       // title
            record.description,                 // description
            record.titleImageId,                // titleImageId
            record.currentVersion,              // currentVersion
            hydratedVersions,                   // versions
            record.metadata,                    // metadata
        );
        return blogPost;
    }

    groupByDate() {
        const groups = new Map();

        if(this.versions?.length)

        this.versions.forEach(version => {
            const date = version.lastChangeDate;

            if (!groups.has(date)) {
                groups.set(date, []);
            }
            groups.get(date).push(version);
        })

        return groups;
    }
}



/**
 * Determines if a blog post is new based on its publication date.
 * A blog post is considered new if it is not older than one week.
 *
 * @param {Date} publicDate - The publication date of the blog post.
 * @returns {boolean} - Returns true if the blog post is not older than one week, otherwise returns false.
 */
export function isBlogPostNew(publicDate: string | Date): boolean {
    const dateObj = publicDate instanceof Date ? publicDate : new Date(publicDate);

    const currentDate = new Date();
    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const timeDifference = currentDate.getTime() - dateObj.getTime();

    return timeDifference <= oneWeekInMilliseconds;
}

/**
 * Returns the most recent `count` blog posts sorted by `publicDate` descending.
 * 
 * @param {BlogPost[]} posts - Array of BlogPost items
 * @param {Number} count - Number of posts to return
 * @returns {BlogPost[]} - Array containing the requested number of most recent BlogPost items
 */
export function getMostRecentBlogPosts(posts: BlogPost[], count: number): BlogPost[] {
    return [...posts]
        .filter(post => post.active) // optional: only include active posts
        .sort((a, b) => b.publicDate.getTime() - a.publicDate.getTime())
        .slice(0, count);
}
