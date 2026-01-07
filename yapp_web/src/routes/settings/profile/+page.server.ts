import type { PageServerLoad } from './$types';
import { UserService } from '$lib/utils/auth/UserService';
import { fail, redirect } from "@sveltejs/kit"

export const load: PageServerLoad = async(event) => {
    const session = await event.locals.auth(event);
    
    if (!session?.user) {
        // Redirect to login if user not authenticated
        throw redirect(302, '/signin');
    }

    return {
        session
    }
}