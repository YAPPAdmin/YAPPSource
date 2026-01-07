import { SurrealDB } from "$lib/database/surrealdb";
import { BlogPostN, BlogRegEntry, type BlogPostVersion, type ChangeLogEntry } from "./blog";
import { v4 as uuidv4 } from 'uuid';



export class BlogService {

    static async readBlogRegistry(): Promise<BlogRegEntry[]> {
        const blogRegistry = await SurrealDB.select("blogreg")

        for (const entry of blogRegistry) {
            const formatedId = `${entry.id.tb}:${entry.id.id}`;
            entry.id = formatedId;
        }        

        return blogRegistry;
    }

    static async addToBlogRegistry(blogPost: BlogPostN) {

        const BlogPostRegEntry = new BlogRegEntry(
            blogPost.id,
            blogPost.title,
            blogPost.description,
            blogPost.authorId,
            blogPost.allLikes,
            blogPost.allDislikes,
            blogPost.allClicks,
            blogPost.category,
            blogPost.tags,
            blogPost.publicDate,
            blogPost.titleImage,
        )

        // Check if entry already exists
        const dbEntry = await SurrealDB.select("blogreg", blogPost.id) 

        // Clear old entry
        if(dbEntry) {
            await SurrealDB.delete("blogreg", blogPost.id)
        }

        // Set Entry
        const result = await SurrealDB.create(BlogPostRegEntry, "blogreg");
        return result;
    }

    static async removeFromBlogRegistry(blogPostId: string) {
        
        try {
            const result = await SurrealDB.delete("blogreg", blogPostId);
            return result;
        } catch(err) {
            console.error(`Error removing BlogPost ${blogPostId} from Reg`);
            console.error(err.stack);
            throw err;
        }
    }

    static async verifyBlogPost(blogPost: BlogPostN, authorId: string = ""): Promise<{ valid: boolean, errors: string[] }> {
        const errors: string[] = [];

        if (!blogPost) {
            return { valid: false, errors: ["BlogPost object is required."] };
        }

        // Check for id
        if(!blogPost.id) errors.push("Missing blogPost id");
        
        // Check for title
        if(!blogPost.title) errors.push("Missing blogPost title");

        // Check for author id
        if(!blogPost.authorId) errors.push("Missing blogPost authorId")

        // Validate authorId
        if(authorId) {
            if(blogPost.authorId != authorId) errors.push("AuthorId invalid")
        }

        // Check if blogPost already exists
        const dbBlog = await SurrealDB.selectByProperty("blog", "id", blogPost.id);
        console.log(dbBlog)
        if(dbBlog.length > 0) errors.push("BlogPost already exists")

        return { valid: errors.length == 0, errors };
    }

    static async createBlogPost(blogPost: BlogPostN) {

        try {
            // Add entry to registry
            BlogService.addToBlogRegistry(blogPost);

            // Add Blog
            const result = await SurrealDB.create(blogPost, "blog");

            if(!result) {
                console.log("Error creating BlogPost!")
            }

            return result;
        } catch (err) {
            console.error(`Error creating BlogPost ${blogPost.title} - ${blogPost.id}`);
            console.error(err.stack);
            throw err;
        }



    }

    static async deleteBlogPost(blogPostId: string) {
        try {
            // Remove entry from registry
            BlogService.removeFromBlogRegistry(blogPostId)
        
            // Remove Blog
            const result = await SurrealDB.delete("blog", blogPostId);

            if(!result) {
                console.log("Error deleting BlogPost!");
            }

            return result;
        } catch(err) {
            console.error(`Error deleting BlogPost ${blogPostId}`);
            console.error(err.stack);
            throw err;
        }


    }

    static async readBlogPost(id?: string, title?: string, category?: string, tags?: string[], publicDate?: Date): Promise<BlogPostN | BlogPostN[] | undefined> {
        try {
            let result;

            // Turn BlogReg ids into Normal ids
            if (id) {
                if (id.startsWith("blogreg:")) {
                    id = id.replace("blogreg:", "blog:");
                } else if (!id.startsWith("blog:")) {
                    id = `blog:${id}`;
                }

                result = await SurrealDB.selectByProperty("blog", "id", id);
            } else if (title) {
                result = await SurrealDB.selectByProperty("blog", "title", title);
            } else if (category) {
                result = await SurrealDB.selectByProperty("blog", "category", category);
            } else if (tags && tags.length > 0) {
                result = await SurrealDB.selectByProperty("blog", "tags", tags);
            } else if (publicDate instanceof Date && !isNaN(publicDate.getTime())) {
                result = await SurrealDB.selectByProperty("blog", "publicDate", publicDate.toISOString());
            } else {
                console.error("No valid search parameter provided.");
                return undefined;
            }

            if (!result) {
                console.error("No blog post found for given criteria.");
                return undefined;
            }

            result = await SurrealDB.select("blog")
            result = result[0]

            console.log("Result: ", result)

            const formatted = BlogPostN.fromDbRecord(result);

            if (!formatted) {
                console.error("Failed to convert DB result to BlogPostN");
                return undefined;
            }

            return formatted;
        } catch (err) {
            console.error("Error reading blog post:", err instanceof Error ? err.message : err);
            return undefined;
        }
    }

    // Create new Version
    static async addVersion(authorId: string, newVersion: BlogPostVersion): Promise<BlogPostN|undefined> {
        console.log("[BLOGPOST/ADDVERSION] Adding new Version")

        // Find corresponding  Blogpost
        const blogPost = BlogPostN.fromDbRecord(await SurrealDB.selectByProperty("blog", "id", newVersion.blogPostId))

        // Verify Version
        if(`blog:${newVersion.blogPostId}` != blogPost.id) {
            console.log("[BLOGPOST/ADDVERSION] IDs are not matching");
            return;
        }

        // Ensure all neccessary fields are filled
        if(!newVersion.id || !newVersion.versionNumber || !newVersion.authorId) {
            console.log("[BLOGPOST/ADDVERSION] Missing fields");
            return;
        }

        // Update version number
        let highestVersionNumber;
        if (blogPost.versions.length > 0) {
            highestVersionNumber = Math.max(...blogPost.versions.map(v => v.versionNumber));
        } else {
            highestVersionNumber = 0;
        }
        newVersion.versionNumber = highestVersionNumber + 1;


        // Update active if neccessary
        let setActive = false;
        if(newVersion.active) {
            setActive = true;
            const oldActiveVersion = blogPost.versions.find(version => version.active == true);
            
            if(!oldActiveVersion) return;

            oldActiveVersion.active = false;
            blogPost.updateCurrentVersion();
        }

        // Set Update time stamp
        const now = new Date();

        // Create changelog entry
        const changeLogEntry: ChangeLogEntry = {
            id: uuidv4(),
            versionId: newVersion.id,
            timestamp: now,
            authorId: authorId,
            action: "create",
            description: newVersion.description?.trim() ? newVersion.description : undefined,
            title: newVersion.title?.trim() ? newVersion.title : undefined,
            content: newVersion.content || undefined,
            public: newVersion.public,
            active: setActive,
        }

        // Make sure that changeLog exists
        if(!newVersion.changelog) {
            newVersion.changelog = [];
        }

        // Append to changelog
        newVersion.changelog.push(changeLogEntry)

        // Append new version
        blogPost.versions.push(newVersion);

        // Update in db
        const dbResult = await SurrealDB.update(blogPost);

        // Check dbResult
        if(!dbResult) {
            console.log("[BLOGPOST/ADDVERSION] Error updating Version in DB")
            return;
        }

        return BlogPostN.fromDbRecord(dbResult);
    }

    // Update Version
    static async updateVersion(authorId: string, updatedVersion: BlogPostVersion): Promise<BlogPostN|undefined> {
        // Find corresponding  Blogpost
        let blogPost = BlogPostN.fromDbRecord(await SurrealDB.selectByProperty("blog", "id", updatedVersion.blogPostId))
        
        // Verify Version
        if(`blog:${updatedVersion.blogPostId}` != blogPost.id) {
            console.log("[BLOGPOST/UPDATEVERSION] IDs are not matching");
            console.log(`blog:${updatedVersion.blogPostId}`, " - ", blogPost.id)
            
            return;
        }

        if(!updatedVersion.id || !updatedVersion.versionNumber || !updatedVersion.authorId) {
            console.log("[BLOGPOST/UPDATEVERSION] Missing fields");
            return;
        }



        // Update version
        const updateIndex = blogPost.versions.findIndex(version => version.id == updatedVersion.id);

        // Check if that version exists, otherwise create new version
        if(updateIndex != -1) {
            blogPost.versions[updateIndex] = updatedVersion;
        } else {
            console.log("[BLOGPOST/UPDATEVERSION] Version not found, creating new one")
            return BlogService.addVersion(authorId, updatedVersion)
        }


        // Update active if neccessary
        let setActive = false;
        if(updatedVersion.active) {
            setActive = true;
            const oldActiveVersion = blogPost.versions.find(version => version.active == true);
            
            if(!oldActiveVersion) return;

            oldActiveVersion.active = false;
            blogPost.updateCurrentVersion();
        }

        // Set Update time stamp
        const now = new Date();

        const changeLogEntry: ChangeLogEntry = {
            id: uuidv4(),
            versionId: updatedVersion.id,
            timestamp: now,
            authorId: authorId,
            action: "update", 
            description: updatedVersion.description?.trim() ? updatedVersion.description : undefined,
            title: updatedVersion.title?.trim() ? updatedVersion.title : undefined,
            content: updatedVersion.content || undefined,
            active: setActive,
            public: updatedVersion.public,
        }

        // Make sure that changeLog exists
        if(!updatedVersion.changelog) {
            updatedVersion.changelog = [];
        }

        // Append to changelog
        updatedVersion.changelog.push(changeLogEntry)

        // Update in db
        const dbResult = await SurrealDB.update(blogPost);

        // Check dbResult
        if(!dbResult) {
            console.log("[BLOGPOST/UPDATEVERSION] Error updating Version in DB")
            return;
        }

        return BlogPostN.fromDbRecord(dbResult);
    }

    // Delete Version
    static async deleteVersion(authorId: string, blogPostId: string, versionId: string) {
        console.log("[BLOGPOST/DELETEVERSION] Deleting version");
        
        // Find corresponding Blogpost
        let blogPost = BlogPostN.fromDbRecord(await SurrealDB.selectByProperty("blog", "id", blogPostId))
        if (!blogPost) return;

        // Find corressponding Version
        const version = blogPost.getVersionById(versionId)

        if(!version) return;

        console.log("DELETING VERSION ", version.title)

        // Check if user is authorized to delete
        if(authorId != blogPost.authorId && authorId != version.authorId ) {
            console.log("[BLOGPOST/DELETEVERSION] Unauthorized")
            return;
        }

        // Filter the version out
        blogPost.versions = blogPost.versions.filter(v => v.id !== versionId);

        // Set new active Version if neccessary
        if(version.active) {
            let highestVersionNumber;
            if (blogPost.versions.length > 0) {
                highestVersionNumber = Math.max(...blogPost.versions.map(v => v.versionNumber));
            } else {
                highestVersionNumber = 0;
            }

            const newActive = blogPost.versions.find(version => version.versionNumber == highestVersionNumber);
            if(newActive) {
                newActive.active = true;
                blogPost.currentVersion = newActive.id;
                console.log(`[BLOGPOST/DELETEVERSION] Set new active Version ${newActive.id}`)
            }
        }

        // Update blogpost to current version
        blogPost.updateCurrentVersion()

        // Update DB
        const result = await SurrealDB.update(blogPost);
        
        if(!result) {
            console.log("[BLOGPOST/DELETEVERSION] Error updating DB after deletion")
            return;
        }
        return BlogPostN.fromDbRecord(result)
    }

    static async testPopulateDb() {
        console.log("POPULATE DB")
        for (let i = 0; i < 5; i++) {
            const randomBlogPost = BlogPostN.generateRndBlogPost();
            await BlogService.createBlogPost(randomBlogPost);
        }
    }



}