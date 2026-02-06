import type { PageServerLoad } from './$types';
import { UserService } from '$lib/utils/auth/UserService';
import { fail, redirect } from "@sveltejs/kit"
import { Logger } from '$lib/utils/logger';
import { SurrealDB } from '$lib/database/newSurrealDB';
import { Uploads } from '$lib/utils/uploads';

export const load: PageServerLoad = async(event) => {
    const session = await event.locals.auth(event);
    
    if (!session?.user) {
        // Redirect to login if user not authenticated
        throw redirect(302, '/signin');
    }

    const fileRegistry = await Uploads.getFileFromRegistry();

    return {
        fileRegistry: JSON.parse(JSON.stringify({fileRegistry}))
    }
}