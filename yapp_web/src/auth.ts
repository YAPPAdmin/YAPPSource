import { CredentialsSignin, SvelteKitAuth } from "@auth/sveltekit"
import { SurrealDBAdapter } from "$lib/database/customSurrealAdapter"
import { createTransport } from "nodemailer"
import { verify } from 'argon2';
import { env } from "$env/dynamic/private";
import {v4 as uuidv4} from "uuid";
import Credentials from "@auth/sveltekit/providers/credentials"
import Nodemailer from "@auth/sveltekit/providers/nodemailer"
import GitHub from "@auth/sveltekit/providers/github"
import { UserService } from "$lib/utils/auth/UserService"
import { Logger } from "$lib/utils/logger"
import { SurrealDB as NewSureralDb } from "$lib/database/newSurrealDB"
import { User, toText, toHTML } from "$lib/utils/auth/User";


export const AUTH_ERRORS = {
    USER_NOT_FOUND: 'user_not_found',
    INVALID_PASSWORD: 'invalid_password',
    MISSING_FIELDS: 'missing_fields',
    SYSTEM_ERROR: 'system_error'
};

export class AuthError extends CredentialsSignin {
    origin: "AUTH" | "DB" | "VALIDATION" | "SYSTEM";

    constructor(code: string, origin: "AUTH" | "DB" | "VALIDATION" | "SYSTEM") {
        super();
        this.code = code;       
        this.origin = origin;   
    }
}

const emailServerPassword = Buffer.from(env.EMAIL_SERVER_PASSWORD, "base64").toString("utf-8");

const emailConfig = {
    host: env.EMAIL_SERVER_HOST, //"mail.privateemail.com"
    port: env.EMAIL_SERVER_PORT, //587,
    auth: {
        user: env.EMAIL_SERVER_USER, //"yapp@yetanotherportfolioplatform.com"
        pass: emailServerPassword,
    },
}

const dbClient = await NewSureralDb.getDB();

export const { handle } = SvelteKitAuth({

    // SurrealDB Adapter
    adapter: SurrealDBAdapter(dbClient),   

    // Storing Sessions as JWT instead of storing a Session Token as Cookie
    session: {
        strategy: "jwt"
    },

    // Auth Providers
    providers: [
        Credentials({
            credentials: {
                email: { type: "text" },
                password: { type: "password" },
            },

            authorize: async (credentials, request) => {

                let user: User | undefined;
                let context: Record<string, any> = {};
                context.provider = "credentials"
                context.authorizationId = uuidv4().replace(/-/g, "");

                // Collect Request Data for Logs
                context.request = {}
                context.request.userAgent = request.headers.get("user-agent") || "unknown";
                context.request.acceptLang = request.headers.get("accept-language") || "unknown";

                try {
                    // Check if email and password were entered
                    if(!credentials.email || !credentials.password) {
                        context.authError = "MISSING_CREDENTIALS"
                        throw new AuthError(AUTH_ERRORS.MISSING_FIELDS, "VALIDATION");
                    }

                    // Get User from DB and check existance
                    user = await UserService.getUser({filter: {email: String(credentials.email)}});
                    if(!user || !(user instanceof User)) {
                        context.authError = "USER_NOT_FOUND"
                        throw new AuthError(AUTH_ERRORS.USER_NOT_FOUND, "DB");
                    }

                    // Get Stored Hash and check existance
                    const storedHash = await UserService.GetPasswordHash(user.getId());
                    if(!storedHash) { 
                        console.log("Womp Womp")
                        context.authError = "HASH_NOT_FOUND"
                        throw new AuthError(AUTH_ERRORS.USER_NOT_FOUND, "DB")
                    }

                    // Validate Password
                    const valid = await verify(storedHash, credentials.password as string);
                    if(!valid) {
                        context.authError = "INVALID_CREDENTIALS"
                        throw new AuthError(AUTH_ERRORS.INVALID_PASSWORD, "VALIDATION")
                    }

                    // Log Successfull Signin
                    Logger.info("[AUTH]", "Successfull Signin", context, {id: String(user.getId()), email: String(user.getEmail())})

                    // Sanitize and return user, completing SignIn
                    user.sanitize();
                    return UserService.toAuthUser(user)

                } catch (error) {

                    let errorOrigin: "AUTH" | "DB" | "VALIDATION" | "SYSTEM";
                    let errorCode: string;

                    console.log("ERROR: ", error)

                    if(error instanceof AuthError) {
                        errorOrigin = error.origin;
                        errorCode = error.code;
                    } else if(error instanceof CredentialsSignin) {
                        errorOrigin = "AUTH";
                        errorCode = "Auth Error"
                    } else {
                        errorOrigin = "SYSTEM";
                        errorCode = "Unexpected Error"
                    }

                    Logger.security(`[AUTH][${errorOrigin}]`, errorCode, String(error), context, user ? { id: user.getId(), email: user.getEmail() } : undefined, error)

                    throw new AuthError(errorCode, errorOrigin)

                }
            }
        }),
        
        Nodemailer({
            server: emailConfig,
            from: emailConfig.auth.user,

            // Custom Email Logic
            async sendVerificationRequest(params) {
                const { identifier, url } = params;
                const { host } = new URL(url)
                const transport = createTransport(emailConfig)

                const verificationUrl = new URL(url);
                verificationUrl.searchParams.set("callbackUrl", "/?from=verification")

                const result = await transport.sendMail({
                    to: identifier,
                    from:"yapp@yetanotherportfolioplatform.com",
                    subject: `Sign in to ${host}`,
                    text: toText(verificationUrl.toString(), host),
                    html: toHTML(verificationUrl.toString(), host),
                })

                const failed = result.rejected.concat(result.pending).filter(Boolean)
                if (failed.length) {
                    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
                }
                
            }
        }),

        GitHub({
            allowDangerousEmailAccountLinking: false,
        })  
    ],

    // Callbacks
    callbacks: {
        async signIn({ profile, event }) {

            console.log("\nEVENT: \n", event)

            // Avoid interfearing in Sign Ups
            if(!profile) return true;

            // Ensure that the email is already in the database
            // This ensures that only registerd users log in via AuthProvider or MagicLink
            if(profile?.email) {
                const dbUser = await UserService.getUser({filter: {email: profile.email}})

                if(dbUser && !Array.isArray(dbUser) && dbUser.getEmail()) {
                    return true
                } else {
                    return "/signin/?error=SignIn&code=emailVerified"
                }
            } else {
                return "/signin/?error=SignIn&code=emailVerified"
            }

        },
    },

    // Events
    events: {
        // Delets Account (not user) on SignOut
        // Accounts stor OAuth information, for example, a user signing in user GitHub gets an Account containing a GitHub token.
        async signOut(message) {
            // await SurrealDB.deleteAccountsByUserId(message.token.sub) 
            await NewSureralDb.delete({table: "account", filter: { userId: `user:${message.token.sub}`}})
        }
    },
    
    // Custom Pages
    pages: {
        signIn: "/signin",
        error: "/signin?error=", // Errors appended automatically
        verifyRequest: "/signup/verifySend"
    },

    trustHost: true,

})

