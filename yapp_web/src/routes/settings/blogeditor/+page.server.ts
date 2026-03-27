import type { PageServerLoad } from './$types';
import { redirect } from "@sveltejs/kit";
import { SurrealDB } from '$lib/database/newSurrealDB';
import { BlogRegistryService, BlogService } from '$lib/utils/blog/blogUtilsSS';
import Surreal, { RecordId } from 'surrealdb';
import { UserService } from '$lib/utils/auth/UserService';

export const load: PageServerLoad = async(event) => {
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email);
    
    if (!session?.user) {
        throw redirect(302, '/signin');
    }


    const blogRegistry = await BlogRegistryService.readBlogRegistry()
    const uniqueAuthorIds = [...new Set(blogRegistry.map(post => post.authorId))];

    // Convert strings to RecordId objects
    const formattedIds = uniqueAuthorIds.map(id => {
        if (id.includes(':')) {
            const [tb, val] = id.split(':');
            return new RecordId(tb, val);
        }
        return new RecordId('user', id);
    });

    const authors = await SurrealDB.select({ table: "user", filter: { id: formattedIds }});

    const authorLookup = authors.reduce((acc, user) => {
        acc[user.id] = user.name || user.email;
        return acc;
    }, {} as Record<string, string>);

    return { 
        user: JSON.parse(JSON.stringify(dbUser)), 
        blogRegistry: JSON.parse(JSON.stringify(blogRegistry)), 
        authorLookup 
    }
}