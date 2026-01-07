+import { SurrealDB } from "$lib/database/surrealdb";
import { Logger } from "$lib/utils/logger";
import { User, validateBirthdate, validateEmail, validateUserName, type UserConfig } from "$lib/utils/auth/User";
import { UserService } from "$lib/utils/authUtilsSS";
import { emailManager } from "$lib/utils/emails";
import type { RequestHandler } from "@sveltejs/kit";
import { hash } from 'argon2';
import { randomUUID } from "crypto";
import { UpdateToken } from "../../../../auth";


export const GET: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)
    
    if(!dbUser || dbUser.getEmailVerified()) {
        return new Response(JSON.stringify({ error: "No Email to Verify" }), { status: 404 });
    }

    try {    
        const token = await UpdateToken.generateToken(dbUser.getId(), "verifyEmail", dbUser.getEmail())

        if(!token) {
            return new Response(JSON.stringify({ error: "Something went wrong in Token Generation" }), { status: 500 });
        }

        await emailManager.sendTokenEmail("yapp", dbUser.getEmail(), "verifyEmail", token.code)

        Logger.info("[USER][EMAILVERIFICATION]", "", {}, {id: dbUser.getId(), email: dbUser.getEmail()});

    }catch (error) {*/-
        Logger.warn("[API][USER]", "Getting Users Failed", String(error), {}, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""})
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}



