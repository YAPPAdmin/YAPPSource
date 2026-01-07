import { UserService } from "$lib/utils/auth/UserService";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (events) => {
    let session = await events.locals.auth()

    if(!session?.user) return {}


    // Always get entire user from database
    const email = session.user.email
    let user = await UserService.readUser("email", email)


    if(!user) return {}
    session.user = user.toJSON();

    return {
        session
    }
}