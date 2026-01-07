import type { PageServerLoad } from './$types';
import { redirect } from "@sveltejs/kit";
import { SurrealDB } from "$lib/database/surrealdb"
import { BlogPostN } from "$lib/utils/blog";
import { BlogService } from '$lib/utils/blogUtilsSS';
import { UserService } from '$lib/utils/auth/UserService';
import { User } from '$lib/utils/auth/User';
import { UserConfig } from '$lib/utils/auth/User';

export const load: PageServerLoad = async(event) => {
	const { slug } = event.params;
    const session = await event.locals.auth()
    const user = await UserService.readUser("email", session?.user?.email)
    
    if(user instanceof User) {
        user.sanitize()
    }

    // Fetch BlogPost
    let post: BlogPostN | undefined = await BlogService.readBlogPost(slug)

    if(!post || !(post instanceof BlogPostN) || post == undefined) {
        return {slug};
    }
    // } else {
    //     post.sanitize();
    // }


    // cache for author information
    let authorCache: any[] = [];

    console.log(post)

    for(const version of post.versions) {
        const authorId = version.authorId;
        const fullAuthorId = authorId.startsWith("user:") ? authorId : `user:${authorId}`;


        // Try finding author data in cache
	    const cacheAuthor = authorCache.find((author) => author.id === fullAuthorId);

        // Append missing Author to cache
        if(!cacheAuthor) {

            // const dbAuthor = await SurrealDB.selectByProperty("user", "id", `user:${authorId}`);
            const dbAuthor = await UserService.getAuthor(authorId)

            if(dbAuthor) {
                authorCache.push(dbAuthor)
            } else {
                const missingAuthorConfig: UserConfig = {
                    id: authorId,
                    username: "Unknown Author",
                    passwdHash: "",
                } 

                const missingAuthor = User.generateUser(missingAuthorConfig);
                authorCache.push(missingAuthor);
            }
            
        }
    }

    return { 
        slug,
        post: JSON.parse(JSON.stringify(post)),
        authorCache: JSON.parse(JSON.stringify(authorCache)),
        user: JSON.parse(JSON.stringify(user)),
    };
}