import { Logger } from "$lib/utils/logger";
import { UserService } from "$lib/utils/auth/UserService";
import { emailManager } from "$lib/utils/emails";
import type { RequestHandler } from "@sveltejs/kit";
import { UpdateToken } from "$lib/utils/auth/authUtilsSS";


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

    }catch (error) {
        Logger.warn("[API][USER]", "Getting Users Failed", String(error), {}, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""})
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}



