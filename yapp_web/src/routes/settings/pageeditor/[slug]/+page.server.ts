import { LayoutService } from '$lib/customRenderer/layoutUtilsSS.js';
import { UserService } from '$lib/utils/auth/UserService.js';
import { PageService } from '$lib/utils/pageEditor/PageServiceSS.js';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email);

    if (!session?.user || !dbUser) {
        throw redirect(303, '/login');
    }


    const rawSlug = event.params.slug;
    const pageId = rawSlug.split(':').pop();
    const pageLayout = await PageService.getPage(pageId);

    if (!pageLayout) {
        throw new Error("Page Not Found")
    }

    return {
        user: JSON.parse(JSON.stringify(dbUser)),
        pageLayout: JSON.parse(JSON.stringify(pageLayout))
    };
};
