import { randomInt } from 'crypto';
import { validateEmail } from './authUtils';
import { SurrealDB as NewSureralDb } from "$lib/database/newSurrealDB"
import {v4 as uuidv4} from "uuid";

export function generateRandomCode() {
    const code = randomInt(0, 1000000);
    return code.toString().padStart(6, "0")
}

export class UpdateToken{
    readonly id: string;
    readonly code: string;
    readonly attempts: number;

    constructor(
        id: string,   
        userId: string,
        type: "updatePassword" | "updateEmail" | "resetPassword" | "verifyEmail",
        timestamp: Date,
        newPassword?: string | undefined,
        newEmail?: string | undefined,
        
    ) {
        this.id = id
        this.code = generateRandomCode();
        this.attempts = 0;
    }

    static async generateToken(userId: string, type: "updatePassword" | "updateEmail" | "resetPassword" | "verifyEmail", value: string) {
        let newToken;
        const newId = uuidv4();
        const dbUser = await UserService.getUser({id: userId})

        // Clear out old tokens before creating new ones
        await UpdateToken.clearOutdated()

        // Verify that user exists
        if(!dbUser) return; 

        switch(type) {

            case "updateEmail": // Update Email Token
                // Verify new email
                if(!validateEmail(value)) return false;

                newToken = new UpdateToken(
                    newId,
                    userId,
                    type,
                    new Date(),
                    undefined,  // Empty new Password
                    value, 
                )
            break;

            case "updatePassword": // Update Password Token
                newToken = new UpdateToken(
                    "",
                    userId,
                    type,
                    new Date(),
                    value,  // Empty new Password 
                )
            break;

            case "verifyEmail":
                if(dbUser.getEmail() != value) {
                    throw new Error("Email Mismatch in verifyEmail Token")
                }

                newToken = new UpdateToken(
                    "",
                    userId,
                    type,
                    new Date(),
                    undefined,
                    value
                )

            case "resetPassword":
                newToken = new UpdateToken(
                    newId,
                    userId,
                    type,
                    new Date(),
                    value
                )

            // Return false on missing type
            default:
                return false; 
        }

        // Delete previous tokens from that user
        // await SurrealDB.deleteByProperty("token", "userId", userId);
        await NewSureralDb.delete({table: "token", filter: { userId: userId }})

        // Reset Attempts
        newToken.attempt = 0;

        // Store Token in DB
        // await SurrealDB.create(newToken, "token")
        await NewSureralDb.create({table: "token", data: newToken});

        return newToken;
    }

    static async clearOutdated() {
        try {
            const now = new Date();
            const cutoff = (new Date(now.getTime() - 15*60*1000)).toISOString();

            // Get all older Tokens
            // const oldTokens = await SurrealDB.query(
            //     `SELECT * FROM token WHERE timestamp < ${cutoff}`
            // )
            const oldTokens = await NewSureralDb.query(`SELECT * FROM token WHERE timestamp < ${cutoff}`)

            if(!oldTokens || oldTokens.length == 0) return false;

            // Delete all old tokens 
            for(const token of oldTokens) {
                // await SurrealDB.delete("token", token.id);
                await NewSureralDb.delete({table: "token", id: token.id})
            }

            Logger.info("[TOKEN]", "Deleted outdated and unused Tokens", {amount: oldTokens.length});

            return true;

        } catch(error) {
            Logger.warn("[TOKEN]", "Error deleting old tokens", String(error));
            return false;
        }
    }

    static async validateToken(userId: string, code: string) {
        // const token = await SurrealDB.selectByProperty("token", "userId", userId);
        const token = await NewSureralDb.select({table: "token", filter: { userId: userId }});

        const dbUser = await UserService.getUser({id: userId});

        await SurrealDB.delete("token", token.id);

        if(!dbUser) return false;

        if(code == token.code) {
            return token;
        } else {
            
            if(token.attempt > 3) {
                // TODO: Deactivate User
                Logger.security("[USER]", "To many Token attempts", "To many Token attempts", {}, {id: dbUser.getId(), email: dbUser.getEmail()})
            } else {
                let newToken = token;
                newToken.attempt += 1;
                await SurrealDB.create(newToken, "token")
            }
        }

        return false;
    }

    static async isTokenTooRecent(userId: string) {
        const dbUser = await UserService.getUser({id: userId})
        if(!dbUser) {
            throw Error("User Not Found");
        }

        try{
            const token = await SurrealDB.selectByProperty("token", "userId", userId);

            if(!token) {
                return false;
            }

            const now = new Date();
            const startTime = new Date(now.getTime() - 1 * 60 * 1000);

            return new Date(token.timestamp) > startTime;
        } catch(error) {
            Logger.warn("[TOKEN]", "Error checking token recency", String(error), {}, {id: dbUser.getId(), email: dbUser.getEmail()})
        }
    }
}