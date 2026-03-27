import { UserService } from "$lib/utils/auth/UserService";
import { PageRegistryService, PageService } from "$lib/utils/pageEditor/PageServiceSS";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../blogeditor/$types";


export const load: PageServerLoad = async(event) => {
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email);
    
    if (!session?.user) {
        throw redirect(302, '/signin');
    }

    const pageRegistry = await PageRegistryService.readPageRegistry();
    
    return {
        user: JSON.parse(JSON.stringify(dbUser)), 
        pageRegistry: JSON.parse(JSON.stringify(pageRegistry))
    }
}