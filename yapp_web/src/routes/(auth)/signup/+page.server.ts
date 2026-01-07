
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../../$types"

import { SurrealDB } from "$lib/database/surrealdb";

export const load: PageServerLoad = async (events) => {
    let session = await events.locals.auth()

    if(!session?.user) return {}

    // Always get entire user from database
    const email = session.user.email
    let user = await SurrealDB.selectByProperty("user", "email", email)

    // Make sure that user is not passed along as an Array
    let iterations = 0;
    while (Array.isArray(user) && iterations < 5) {
        user = user[0];
        iterations++;
    }

    if(!user) return {}

    user.id = user.id.id
    session.user = user


    if(session?.user?.id) {
        throw redirect(302, '/?from=signup');
    }

}

