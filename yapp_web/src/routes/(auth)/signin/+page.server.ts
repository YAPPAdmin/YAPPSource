import type { PageServerLoad } from './$types';
import { UserService } from '$lib/utils/auth/UserService';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async(events) => {
    let session = await events.locals.auth()

    if(session && session.user) {
        throw redirect(302, '/?from=signin');
    }
    
    return {
        session
    }
}


