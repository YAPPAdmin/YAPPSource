import type { PageServerLoad } from './$types';
import { UserService } from '$lib/utils/auth/UserService';
import { fail, redirect } from "@sveltejs/kit"
import { SurrealDB } from '$lib/database/surrealdb';
import { Logger } from '$lib/utils/logger';

export const load: PageServerLoad = async(event) => {
    const session = await event.locals.auth(event);

    if (!session?.user) {
        // Redirect to login if user not authenticated
        throw redirect(302, '/signin');
    }

    // SSR Logs
    const logs = await SurrealDB.selectPaginated("log", 100, 0);
    const serializedLogs = SurrealDB.serialize(logs.result)
    const total = logs.total;

    // SSR Users
    let adminUsers = await UserService.readUser("role", "admin")
    let modUsers = await UserService.readUser("role", "moderator")

    if(!Array.isArray(adminUsers)) {
        adminUsers = [adminUsers];
        
    }

    if(!Array.isArray(modUsers)) {
        modUsers = [modUsers];
        
    }

    return {
        session,
        serializedLogs,
        total,
        users: JSON.parse(JSON.stringify({
            adminUsers,
            modUsers,
        }))
    }
}