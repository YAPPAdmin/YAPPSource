import type { PageServerLoad } from './$types';
import { redirect } from "@sveltejs/kit";
import { SurrealDB } from "$lib/database/surrealdb"
import { BlogPost } from "$lib/utils/blog/blog";
import { BlogService } from '$lib/utils/blog/blogUtilsSS';
import { UserService } from '$lib/utils/auth/UserService';
import { User, UserConfig } from '$lib/utils/auth/User';

export const load: PageServerLoad = async(event) => {
	const { slug } = event.params;
    const session = await event.locals.auth()
    const user = await SurrealDB.selectByProperty("user", "email", session?.user?.email)

    if(!session?.user?.email || !user) {
        throw redirect(302, "/signin");
    }

    // Fetch BlogPost
    let blogPost: BlogPost[] = await BlogService.readBlogPost(slug)

    return { 
        slug,
        user: JSON.parse(JSON.stringify(user)),
        blogPost: JSON.parse(JSON.stringify(blogPost[0])),
    };
}