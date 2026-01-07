import { v4 as uuidv4 } from 'uuid';


export class BlogRegEntry {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public authorId: string,
        public allLikes: number,
        public allDislikes: number,
        public allClicks: number,
        public category: string,
        public tags: string[],
        public publicDate: Date,
        public titleImage?: string,
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


export class SimpleRating {
    constructor(
        public id: string,
        public type: "like" | "dislike" | "click"
    ) { }
}


export class AdvancedRating {
    constructor(
        public id: string,
        public type: "like" | "dislike" | "click",
        public area: string,
        public device: "desktop" | "laptop" | "tablet" | "mobile" | "other",
        public date: Date,
        public referrer: "searchEngine" | "socialMedia" | "email" | "other"
    ) { }
}


export class BlogPostShort {
    constructor(
        public id: string,
        public authorId: string
    ) { }
}


export type BlogPostVersion = {
    id: string;
    blogPostId: string;
    versionNumber: number;
    title: string;
    authorId: string;
    updatedAt: Date;
    public: boolean;
    active: boolean;
    description: string;
    versionTitle: string;
    versionDescription: string;
    category: string;
    tags: string[];
    content: any;
    language?: string;
    changelog?: ChangeLogEntry[];
};


export class BlogPostN {
    constructor(
        public id: string,
        public versions: BlogPostVersion[],
        public currentVersion: string,
        public title: string,
        public authorId: string,
        public description: string,
        public category: string,
        public tags: string[],
        public publicDate: Date | undefined,
        public clicks?: SimpleRating[] | AdvancedRating[],
        public likes?: SimpleRating[] | AdvancedRating[],
        public dislikes?: SimpleRating[] | AdvancedRating[],
        public allLikes?: number,
        public allDislikes?: number,
        public allClicks?: number,
        public titleImage?: string,
        public changeLog?: [],
    ) { }

    updateCurrentVersion() {
        let currentVersion = this.versions.find(version => version.active == true);

        if(!currentVersion) {
            // If there is no active Version, set new one
            let highestVersionNumber;
            if (this.versions.length > 0) {
                highestVersionNumber = Math.max(...this.versions.map(v => v.versionNumber));
            } else {
                highestVersionNumber = 0;
            }

            const newActive = this.versions.find(version => version.versionNumber == highestVersionNumber);
            if(newActive) {
                newActive.active = true;
                this.currentVersion = newActive.id;
                currentVersion = this.versions.find(version => version.active == true);
            }
        }

        if(!currentVersion) {
            console.log(`[BLOGPOSTN/updateCurrentVersion]Error getting active Version for ${this.title} - ${this.id}`)
            return;
        }
            
        // Update BlogPost properties from active Version
        this.title = currentVersion.title || "No Title";
        this.description = currentVersion.description || "No Description";
        this.category = currentVersion.category || "";
        this.tags = currentVersion.tags || [];
        this.publicDate = currentVersion.updatedAt;
    }

    // #region Versions

    getActiveVersion(): BlogPostVersion | undefined {
        return this.versions.find(version => version.active == true)
    }

    getVersionById(versionId: string): BlogPostVersion | undefined {
        return this.versions.find(version => version.id === versionId);
    }

    getVersionByNumber(versionNumber: number): BlogPostVersion | undefined {
        return this.versions[versionNumber];
    }

    //#endregion

    //#region Rating
    toggleLike() {
        return;
    }

    toggleDislike() {
        return;
    }

    addClick() {
        return;
    }
    //#endregion

    static fromDbRecord(record: any) {
       
        const formatedId = BlogPostN.getFormattedId(record);

        record.id = formatedId;

        const blogPost: BlogPostN = new BlogPostN(
            record.id,
            record.versions,
            record.currentVersion,
            record.title,
            record.authorId,
            record.description,
            record.category,
            record.tags,
            new Date(record.publicDate),
            record.clicks,
            record.likes,
            record.dislikes,
            record.allLikes,
            record.allDislikes,
            record.allClicks,
            record.titleImage,
        );

        return blogPost;
    }

    static getFormattedId(record: any) {
        // Handle case where record is an array
        if (Array.isArray(record) && record.length > 0) {
            record = record[0];
        }

        // Handle case where id is an object like { tb: 'blog', id: '...' }
        if (record?.id?.tb && record.id.id) {
            return `${record.id.tb}:${record.id.id}`;
        }
        // Handle case where id is just a string
        else if (typeof record?.id === 'string') {
            return `blog:${record.id}`; // or use a default table name if needed
        }
        // Handle unexpected cases (return null or throw an error)
        else {
            console.error("Invalid record or id format:", record);
            return null;
        }
    }


    static fromJSON(blogpostJson): BlogPostN {
        const blogPost = new BlogPostN(
            blogpostJson.id,
            blogpostJson.versions,
            blogpostJson.currentVersion,
            blogpostJson.title,
            blogpostJson.authorId,
            blogpostJson.description,
            blogpostJson.category,
            blogpostJson.tags,
            blogpostJson.publicDate,
            blogpostJson.clicks,
            blogpostJson.likes,
            blogpostJson.dislikes,
            blogpostJson.allLikes,
            blogpostJson.allDislikes,
            blogpostJson.allClicks,
            blogpostJson.titleImage,
        )
        return blogPost;
    }

    static createDraftVersion(authorId: string, baseVersion?: BlogPostVersion, blogPost?: BlogPostN): BlogPostVersion {

        let newDraftVersion: BlogPostVersion;

        // Create a new Version based of a previous version
        if (baseVersion) {
            newDraftVersion = {
                id: uuidv4().replace(/-/g, ""),
                blogPostId: baseVersion.blogPostId,
                versionNumber: baseVersion.versionNumber + 1,
                title: baseVersion.title,
                authorId: authorId,
                updatedAt: new Date(),
                public: false,
                active: false,
                description: baseVersion.description,
                versionTitle: `Draft based on ${baseVersion.title}`,
                versionDescription: `Draft based on ${baseVersion.title}`,
                category: baseVersion.category,
                tags: baseVersion.tags,
                content: baseVersion.content,
            }

        // Create a new Version based of a blogpost
        } else if (blogPost) {
            newDraftVersion = {
                id: uuidv4().replace(/-/g, ""),
                blogPostId: blogPost.id,
                versionNumber: Math.max(...blogPost.versions.map(version => version.versionNumber)) + 1,
                title: "New Draft",
                authorId: authorId,
                updatedAt: new Date(),
                public: false,
                active: false,
                description: "New Draft Version",
                versionTitle: "New Draft Version",
                versionDescription: "New Draft Version",
                category: blogPost.category,
                tags: blogPost.tags,
                content: blogPost.getActiveVersion()?.content,
            }
        }

        return newDraftVersion;
    }

    sanitize() {
        // Clear not public versions
        this.versions = this.versions.filter(
            version => version.active || version.public
        );

        // Clear detailed metadata
        this.clicks = [];
        this.likes = [];
        this.dislikes = [];

    }

    //#region Group/Sort
    sortVersionsNewToOld() {
        this.versions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }

    sortVersionsOldToNew() {
        this.versions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }

    groupByDate() {
        const groups = new Map();

        this.versions.forEach(version => {
            const date = version.updatedAt;

            if (!groups.has(date)) {
                groups.set(date, []);
            }
            groups.get(date).push(version);
        })

        return groups;
    }
    //#endregion

    static generateRndBlogPost() {
        const titles = [
            "Getting Started with SvelteKit",
            "Advanced Tailwind CSS Techniques",
            "Mastering Reactive State in Svelte",
            "Building a Responsive Navbar with Tailwind",
            "Deploying SvelteKit to Vercel",
            "Authentication in SvelteKit with Supabase",
            "Dark Mode Toggle with Tailwind and Svelte",
            "Creating Reusable Components in Svelte",
            "Server-Side Rendering in SvelteKit Explained",
            "Forms and Validation in SvelteKit",
            "Using Actions and Transitions in Svelte",
            "Optimizing Lighthouse Scores with TailwindCSS",
            "Making Your SvelteKit App SEO-Friendly",
            "Integrating Markdown Content in SvelteKit",
            "Styling SvelteKit with Tailwind and DaisyUI",
            "Dynamic Routing and Layouts in SvelteKit",
            "Fetching Data from APIs in SvelteKit",
            "Building a Toast Notification System in Svelte",
            "Creating a Blog with SvelteKit and Markdown",
            "Handling Form Errors Gracefully in SvelteKit"
        ];

        const randomTitle = titles[Math.floor(Math.random() * titles.length)];

        const id = `TEST${uuidv4().replace(/-/g, "")}`
        const allLikes = Math.random() * 100;
        const allDislikes = Math.random() * 10;
        const allClicks = Math.random() * 1000;

        const width = 1920;
        const height = 1080;
        const seed = Math.floor(Math.random() * 10000);
        const titleImage = `https://picsum.photos/seed/${seed}/${width}/${height}`;

        const likeData: AdvancedRating[] = (() => {
            let likes: AdvancedRating[] = []
            const dev: Array<"desktop" | "laptop" | "tablet" | "mobile" | "other"> = ["desktop", "laptop", "tablet", "mobile", "other"]
            const ret: Array<"searchEngine" | "socialMedia" | "email" | "other"> = ["searchEngine", "socialMedia", "email", "other"]

            for (let i = 0; i < allLikes; i++) {
                const start = new Date("2020-01-01")
                const end = new Date("2026-01-01")
                const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

                let like = new AdvancedRating(
                    uuidv4().replace(/-/g, ""),
                    "like",
                    "AT",
                    dev[Math.floor(Math.random() * dev.length)],
                    randomDate,
                    ret[Math.floor(Math.random() * ret.length)],
                )

                likes.push(like)
            }
            return likes
        })();

        const dislikeData: AdvancedRating[] = (() => {
            let dislikes = []
            const dev: Array<"desktop" | "laptop" | "tablet" | "mobile" | "other"> = ["desktop", "laptop", "tablet", "mobile", "other"]
            const ret: Array<"searchEngine" | "socialMedia" | "email" | "other"> = ["searchEngine", "socialMedia", "email", "other"]

            for (let i = 0; i < allDislikes; i++) {
                const start = new Date("2020-01-01")
                const end = new Date("2026-01-01")
                const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

                let dislike = new AdvancedRating(
                    uuidv4().replace(/-/g, ""),
                    "like",
                    "AT",
                    dev[Math.floor(Math.random() * dev.length)],
                    randomDate,
                    ret[Math.floor(Math.random() * ret.length)],
                )

                dislikes.push(dislike)
            }
            return dislikes
        })();

        const clickData: AdvancedRating[] = (() => {
            let clicks = []
            const dev: Array<"desktop" | "laptop" | "tablet" | "mobile" | "other"> = ["desktop", "laptop", "tablet", "mobile", "other"]
            const ret: Array<"searchEngine" | "socialMedia" | "email" | "other"> = ["searchEngine", "socialMedia", "email", "other"]

            for (let i = 0; i < allClicks; i++) {
                const start = new Date("2020-01-01")
                const end = new Date("2026-01-01")
                const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

                let click = new AdvancedRating(
                    uuidv4().replace(/-/g, ""),
                    "like",
                    "AT",
                    dev[Math.floor(Math.random() * dev.length)],
                    randomDate,
                    ret[Math.floor(Math.random() * ret.length)],
                )

                clicks.push(click)
            }
            return clicks
        })();

        const versionData: BlogPostVersion[] = [

            {
                id: `TESTVERSION-${uuidv4().replace(/-/g, "")}`,
                blogPostId: id,
                versionNumber: 1,
                title: randomTitle,
                authorId: "256z72gp1rwx7arzw08v",
                updatedAt: new Date("2025-01-04T10:00:00"),
                public: false,
                active: false,
                description: "An introductory guide to web development.",
                versionTitle: "Initial Version",
                versionDescription: "Inital Version",
                category: "Technology",
                tags: ["HTML", "CSS", "JavaScript"],
                content: {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "Welcome to " },
                                { "type": "text", "marks": [{ "type": "highlight" }], "text": "Web Development" },
                                { "type": "text", "text": "!" }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "This is your first step into creating amazing websites." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "$\\LaTeX$ $\\int_{a}^{b} x^2 \\,dx$" }
                            ]
                        }
                    ]
                }
            },

            {
                id: `TESTVERSION-${uuidv4().replace(/-/g, "")}`,
                blogPostId: id,
                versionNumber: 2,
                title: randomTitle,
                authorId: "1234567890",
                updatedAt: new Date("2025-01-04T11:30:00"),
                public: true,
                active: false,
                description: "Explore advanced CSS techniques to enhance your web projects.",
                versionTitle: "Small Update",
                versionDescription: "Updated Descriptions and stuff",
                category: "Technology",
                tags: ["CSS", "Design", "Frontend"],
                content: {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "Mastering " },
                                { "type": "text", "marks": [{ "type": "highlight" }], "text": "CSS" },
                                { "type": "text", "text": " can transform your designs." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "Learn about animations, transitions, and more." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "$\\LaTeX$ $\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$" }
                            ]
                        }
                    ]
                }
            },

            {
                id: `TESTVERSION-${uuidv4().replace(/-/g, "")}`,
                blogPostId: id,
                versionNumber: 3,
                title: randomTitle,
                authorId: "256z72gp1rwx7arzw08v",
                updatedAt: new Date("2025-01-05T10:00:00"),
                public: false,
                active: false,
                description: "Take your JavaScript skills to the next level.",
                versionTitle: "Changed Date",
                versionDescription: "Just changed the Date",
                category: "Programming",
                tags: ["JavaScript", "ES6", "Programming"],
                content: {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "The future of web development is bright with " },
                                { "type": "text", "marks": [{ "type": "highlight" }], "text": "new technologies" },
                                { "type": "text", "text": "." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "Stay ahead by learning about WebAssembly, PWAs, and more." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "$\\LaTeX$ $\\mathbf{F} = m\\mathbf{a}$" }
                            ]
                        }
                    ]
                },
            },

            {
                id: `TESTVERSION-${uuidv4().replace(/-/g, "")}`,
                blogPostId: id,
                versionNumber: 4,
                title: randomTitle,
                authorId: "1234567890",
                updatedAt: new Date("2025-01-07T14:20:00"),
                public: false,
                active: false,
                description: "Learn how to make your websites look great on any device.",
                versionTitle: "",
                versionDescription: "",
                category: "Technology",
                tags: ["Responsive Design", "CSS", "Mobile"],
                content: {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "JavaScript is more than just " },
                                { "type": "text", "marks": [{ "type": "highlight" }], "text": "loops and functions" },
                                { "type": "text", "text": "." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "Dive into closures, promises, and asynchronous programming." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "$\\LaTeX$ $E = mc^2$" }
                            ]
                        }
                    ]
                },
            },

            {
                id: `TESTVERSION-${uuidv4().replace(/-/g, "")}`,
                blogPostId: id,
                versionNumber: 5,
                title: randomTitle,
                authorId: "1234567890",
                updatedAt: new Date("2025-01-12"),
                public: true,
                active: false,
                description: "A beginner's guide to React, a popular JavaScript library.",
                versionTitle: "Backup Version",
                versionDescription: "Made a backup version before some changes",
                category: "Technology",
                tags: ["React", "JavaScript", "Frontend"],
                content: {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "Responsive design ensures your site looks good on " },
                                { "type": "text", "marks": [{ "type": "highlight" }], "text": "any device" },
                                { "type": "text", "text": "." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "Use media queries and flexible grids to achieve this." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "$\\LaTeX$ $\\frac{d}{dx}\\left(\\int_{0}^{x} f(u) \\, du\\right) = f(x)$" }
                            ]
                        }
                    ]
                },
            },

            {
                id: `TESTVERSION-${uuidv4().replace(/-/g, "")}`,
                blogPostId: id,
                versionNumber: 6,
                title: randomTitle,
                authorId: "1234567890",
                updatedAt: new Date("2025-01-12"),
                public: false,
                active: true,
                description: "Explore the emerging trends and technologies in web development.",
                versionTitle: "Small Changes",
                versionDescription: "Changed some Stuff",
                category: "Technology",
                tags: ["Future", "Trends", "Innovation"],
                content: {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "Responsive design ensures your site looks good on " },
                                { "type": "text", "marks": [{ "type": "highlight" }], "text": "any device" },
                                { "type": "text", "text": "." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "Use media queries and flexible grids to achieve this." }
                            ]
                        },
                        {
                            "type": "paragraph",
                            "attrs": { "textAlign": "left" },
                            "content": [
                                { "type": "text", "text": "$\\LaTeX$ $\\frac{d}{dx}\\left(\\int_{0}^{x} f(u) \\, du\\right) = f(x)$" }
                            ]
                        }
                    ]
                },
            }
        ];


        const data = {
            id: id,
            versions: versionData,
            currentVersion: "294610af-6a7e-4d1f-9ef6-3a14a8f030d6",
            title: randomTitle,
            authorId: "1234567890",
            description: "A beginner's guide to React, a popular JavaScript library.",
            category: "Technology",
            tags: ["React", "JavaScript", "Frontend"],
            publicDate: new Date("2023-10-01"),
            clicks: [],
            likes: [],
            dislikes: [],
            allLikes: allLikes,
            allDislikes: allDislikes,
            allClicks: allClicks,
            titleImage: titleImage,
        };


        const testBlogPost = new BlogPostN(
            data.id,
            data.versions,
            data.currentVersion,
            data.title,
            data.authorId,
            data.description,
            data.category,
            data.tags,
            data.publicDate,
            data.clicks,
            data.likes,
            data.dislikes,
            data.allLikes,
            data.allDislikes,
            data.allClicks,
            data.titleImage,
        );

        return testBlogPost;
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
 * @param {BlogPostN[]} posts - Array of BlogPost items
 * @param {Number} count - Number of posts to return
 * @returns {BlogPostN[]} - Array containing the requested number of most recent BlogPost items
 */
export function getMostRecentBlogPosts(posts: BlogPostN[], count: number): BlogPostN[] {
    return [...posts]
        .filter(post => post.active) // optional: only include active posts
        .sort((a, b) => b.publicDate.getTime() - a.publicDate.getTime())
        .slice(0, count);
}
