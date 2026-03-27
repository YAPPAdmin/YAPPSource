import { SurrealDB } from "$lib/database/surrealdb";
import { SurrealDB as SurrealDBNEW } from "$lib/database/newSurrealDB"
import { BlogPost, BlogRegEntry } from "./blog";
import { v4 as uuidv4 } from 'uuid';
import type { BlogPostVersion, ChangeLogEntry, VersionDraft } from "./blogversion";

export class BlogRegistryService {
    static async readBlogRegistry(): Promise<BlogRegEntry[]> {
        const blogRegistry = await SurrealDBNEW.select({ table: "blogreg" });
        return blogRegistry;
    }

    static async addToBlogRegistry(blogPost: BlogPost) {

        if(!blogPost.id || !blogPost.creationDate || !blogPost.authorId || !blogPost.title) {
            console.error("Missing Params");
            return;
        };

        const BlogPostRegEntry = new BlogRegEntry(
            blogPost.id, 
            blogPost.creationDate, 
            blogPost.authorId, 
            blogPost.title, 
            blogPost.description, 
            blogPost.titleImageId, 
            blogPost.metadata, 
        )

        // Check if entry already exists
        const dbEntry = await SurrealDBNEW.select({ table: "blogreg", id: blogPost.id })
        if(dbEntry.length) {
            console.error("BlogPost already exists in Registry")
            return 
        }

        // Set Entry
        const result = await SurrealDBNEW.create({ table: "blogreg", data: BlogPostRegEntry});
        return result;
    }

    static async removeFromBlogRegistry(blogPostId: string) {
        try {
            const result = await SurrealDBNEW.delete({ table: "blogreg", id: blogPostId });
            return result;
        } catch(error) {
            console.error(`Error removing BlogPost ${blogPostId} from Reg`);
            console.error(error)
        }
    }
}

export class BlogService {

    //#region BlogPost
    static async verifyBlogPost(blogPost: BlogPost, authorId: string = ""): Promise<{ valid: boolean, errors: string[] }> {
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

    static async createBlogPost(blogPost: BlogPost): Promise<any[]> {

        try {
            // Add entry to registry
            const registryResult = BlogRegistryService.addToBlogRegistry(blogPost);

            if(!registryResult) {
                console.error("Creating Registry Entry failed");
                return [];
            }

            // Add Blog
            const result = await SurrealDBNEW.create({ table: "blog", data: blogPost});

            if(!result.length) {
                console.log("Error creating BlogPost!")
            }

            return result;

        } catch (error) {
            console.error(`Error creating BlogPost ${blogPost.title} - ${blogPost.id}`);
            console.error(error);
            return []
        }
    }

    static async deleteBlogPost(blogPostId: string, userId: string) {
        try {
            if(!blogPostId || !userId) return;

            // Remove entry from registry
            const registryResult = await BlogRegistryService.removeFromBlogRegistry(blogPostId)

            if(!registryResult) {
                console.error("Deleting Registry Entry failed");
                return;
            }
        
            // Convert blogreg to blog ids
            let blogId = blogPostId;
            if(blogId.startsWith("blogreg:")) {
                blogId = blogId.replace("blogreg:", "blog:")
            }

            // Remove Blog
            const result = await SurrealDBNEW.delete({ table: "blog", id: blogId });

            if(!result.length) {
                console.log("Error deleting BlogPost!");
            }

            return result;
        } catch(error) {
            console.error(`Error deleting BlogPost ${blogPostId}`);
            console.error(error);
        }


    }

    static async readBlogPost(id?: string, title?: string, category?: string, tags?: string[], publicDate?: Date): Promise<BlogPost[]> {
        try {
            // Convert blogreg to blog ids
            let blogId = id?.toString();
            if(blogId && blogId.startsWith("blogreg:")) {
                blogId = blogId.replace("blogreg:", "blog:")
            }

            const result = await SurrealDBNEW.select({ 
                table: "blog", 
                id: blogId,
                filter: {
                    ...(category && { category }),
                    ...(publicDate && { publicDate }),
                },
                search: {
                    ...(title && { title }),
                    ...(tags && tags.length > 0 && { tags: tags[0] }) 
                }
            });
            
            if (!result.length) {
                console.error("No blog post found for given criteria.");
                return [];
            }

            const blogPosts = result.map((record: any) => BlogPost.fromDbRecord(record));
            return blogPosts.filter((post: any) => post !== undefined) as BlogPost[];

        } catch (error) {
            console.error("Error reading blog post");
            console.error(error);
        }
        return [];
    }

    //#endregion

    //#region VERSIONS
    /**
     * Attatches a version to a blog in the database
     * @param authorId 
     * @param newVersion BlogPostVersion
     * @returns 
     */
    static async addVersion(authorId: string, newVersion: BlogPostVersion): Promise<BlogPost|undefined> {
        // Find corresponding  Blogpost
        const dbBlogPost = await BlogService.readBlogPost(newVersion.blogPostId)
        
        if(!dbBlogPost || dbBlogPost.length == 0) {
            console.error("[BLOGPOST/ADDVERSION] Base blog post not found in DB.");
            return;
        }

        const blogPost = dbBlogPost[0]

        // Ensure all neccessary fields are filled
        if(!newVersion.id || !newVersion.versionNumber || !newVersion.authorId) {
            console.log("[BLOGPOST/ADDVERSION] Missing fields");
            return;
        }

        // Update active if neccessary
        let setActive = false;
        if(newVersion.isMainVersion) {
            setActive = true;
            if(blogPost.versions?.length) {
                const oldActiveVersion = blogPost.versions.find(version => version.isMainVersion == true);
                
                if(oldActiveVersion) {
                    oldActiveVersion.isMainVersion = false;
                    blogPost.updateCurrentVersion();
                }
            }
        }

        const changeLogEntry: ChangeLogEntry = {
            id: uuidv4().replace(/-/g, ""),
            changeDate: new Date(),
            changeAuthorId: authorId,
            changes: {
                editorData: newVersion.EditorData,
                versionData: newVersion.versionData,
                isMainVersion: newVersion.isMainVersion,
                isPublicVersion: newVersion.isPublicVersion,
            },
            changeMessage: "Created",
        }

        // Make sure that changeLog exists
        newVersion.changeLog ??= [];

        // Append to changelog
        newVersion.changeLog.push(changeLogEntry)

        // Make sure that versions exist
        blogPost.versions ??= [];

        // Append new version
        blogPost.versions.push(newVersion);


        // Update in db
        const dbResult = await SurrealDBNEW.update(blogPost, authorId);

        console.log(dbResult)

        // Check dbResult
        if(!dbResult) {
            console.log("[BLOGPOST/ADDVERSION] Error updating Version in DB")
            return;
        }

        return BlogPost.fromDbRecord(dbResult[0]);
    }

    static async updateVersion(authorId: string, newVersion: BlogPostVersion, changeMessage?: string): Promise<BlogPost|undefined> {
        try {   
            // Find corresponding Blogpost
            const blogPostList = await BlogService.readBlogPost(newVersion.blogPostId)
            const blogPost = blogPostList[0]

            // Find version
            const version = blogPost.getVersion(newVersion.id)
            if(!version) {
                console.warn(`[BLOGPOST/UPDATEVERSION] Could not find version ${newVersion.id} inside BlogPost.`);
                return undefined;
            }

            // Update Version
            const updatedVersion = version.update(authorId, newVersion, changeMessage)

            if(!updatedVersion) {
                console.warn(`[BLOGPOST/UPDATEVERSION] Could not find version ${updatedVersion.id} inside BlogPost.`);
                return undefined;
            }

            // Return Version to blogpost
            blogPost.updateVersion(updatedVersion)

            if(updatedVersion.isMainVersion && blogPost.versions) {
                blogPost.versions.forEach(version => {
                    if(version.id != updatedVersion.id) {
                        version.isMainVersion = false
                    }
                })
            }

            // Update in db
            const dbResult = await SurrealDBNEW.update(blogPost);
            
            if (!dbResult || dbResult.length === 0) {
                console.error("[BLOGPOST/UPDATEVERSION] Error updating Version in DB");
                return undefined;
            }

            return BlogPost.fromDbRecord(dbResult[0]);

        } catch (error) {
            console.error("[BLOGPOST/UPDATEVERSION] Fatal Exception:", error);
            return undefined;
        }
    }

    static async deleteVersion(authorId: string, blogPostId: string, versionId: string): Promise<BlogPost|undefined> {
        try {    
            // Find corresponding  Blogpost
            const blogPostList = await BlogService.readBlogPost(blogPostId)
            const blogPost = blogPostList[0]

            // Find version
            const version = blogPost.getVersion(versionId)
            if(!version) {
                console.warn(`[BLOGPOST/UPDATEVERSION] Could not find version ${versionId} inside BlogPost.`);
                return undefined;
            }

            // Only allow version/blog author to delete
            if(blogPost.authorId != authorId && version.authorId != authorId) {
                return undefined
            }

            // Delete version from blog
            blogPost.deleteVersion(versionId);

            // Update DB
            const dbResult = await SurrealDBNEW.update(blogPost);

            if (!dbResult || dbResult.length === 0) {
                console.error("[BLOGPOST/DELETEVERSION] Error deleting Version in DB");
                return undefined;
            }
        } catch (error) {
            console.error("[BLOGPOST/UPDATEVERSION] Fatal Exception:", error);
            return undefined;
        }
    }

    //#endregion

    //#region Drafts

    /**
     * Saves a users draft for a specific blog post version.
     * @param  draft The draft data to be saved.
     * @param userId userId
     * @returns The updated version object.
     * @throws {Error} If the draft is invalid, blog post is missing, version is missing, or user doesn't own the draft.
     */
    static async saveDraft(draft: VersionDraft, userId: string): Promise<BlogPostVersion[]> {
        // Throw on missing draft
        if(!draft) throw new Error("Invalid draft");

        // Try to find coresponding blogpost
        const blogPostList = await BlogService.readBlogPost(draft.blogPostId);
        const blogPost = blogPostList[0]

        // Throw on missing blog
        if(!blogPost) throw new Error("BlogPost not found")
        
        // Get Version
        const version = blogPost.getVersion(draft.versionId);

        // Throw on missing version
        if(!version) throw new Error("Version not found");

        // Add draft to version
        version.saveDraft(draft);

        // Add updated version to blogpost
        blogPost.updateVersion(version)

        // Add to db
        const result = await SurrealDBNEW.update(blogPost, userId);
        console.log(result)
        return result
    }

    /**
     * Delets a draft from a specific blogpost and version by its author id
     * @param blogPostId blogPostId
     * @param versionId versionID
     * @param authorId authorId
     * @returns Updated BlogPost object
     */
    static async deleteDraft(blogPostId: string, versionId: string, authorId: string): Promise<BlogPost> {
        if(!blogPostId || !versionId || !authorId) throw new Error("Missing parameters");

        // Try to find coresponding blogpost
        const blogPostList = await BlogService.readBlogPost(blogPostId)
        const blogPost = blogPostList[0]

        // Throw on missing blog
        if(!blogPost) throw new Error("BlogPost not found")
        
        // Get Version
        const version = blogPost.getVersion(versionId);

        // Throw on missing version
        if(!version) throw new Error("Version not found");

        // Delete draft from version
        version.deleteDraft(authorId);

        // Add updated version to blogpost
        blogPost.updateVersion(version)

        // Add to db
        const result = await SurrealDBNEW.update(blogPost, authorId);
        console.log(result)
        return result

    }

    //#endregion

    //#region TEST
    static async testPopulateDb() {
        console.log("POPULATE DB")
        for (let i = 0; i < 5; i++) {
            const randomBlogPost = BlogPost.generateRndBlogPost();
            await BlogService.createBlogPost(randomBlogPost);
        }
    }
    //#endregion


}