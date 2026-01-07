import type { PageServerLoad } from './$types';
import { redirect } from "@sveltejs/kit";
import { SurrealDB } from "$lib/database/surrealdb"
import { BlogService } from '$lib/utils/blogUtilsSS';

export const load: PageServerLoad = async(event) => {
    const session = await event.locals.auth()
    const user = await SurrealDB.selectByProperty("user", "email", session?.user?.email)

    // await BlogService.testPopulateDb()

    if(!session?.user?.email || !user) {
        throw redirect(302, "/signin");
    }

    const blogRegistry = await BlogService.readBlogRegistry()
    
    return { user: JSON.parse(JSON.stringify(user)), blogRegistry: JSON.parse(JSON.stringify(blogRegistry)) }
}