// SERVER SIDE ONLY Auth Utils

import { SurrealDB } from "$lib/database/surrealdb";
import { SurrealDB as NewSurrealDB } from "$lib/database/newSurrealDB";
import { User, type Role } from "./User";
import { validateBirthdate, validateEmail, validateUserName } from "./authUtils";
import type { UserConfig } from "./User";
import { Logger } from "$lib/utils/logger";
import { dev } from "$app/environment";


export class UserService {

    static async createUser(user: User) {
        const result = await SurrealDB.create(user, "user");

        if(!result) {
            console.log("Error creating User!")
        }

        return result; 
    }

    // OLD
    static async readUser(property: string, value: any): Promise<User | undefined> {
        const result = await SurrealDB.selectByProperty("user", property, value)

        if(!result || result.length == 0) {
            return;
        }

        if(Array.isArray(result)) {
            return result.map((record: any) => {
                const dbUser = User.fromDbRecord(record);
                dbUser.sanitize();
                return dbUser
            });
        } else {
            const dbUser = User.fromDbRecord(result)
            dbUser.sanitize()
            return dbUser;
        }
    }

    static async getUser(options: {id?: string, filter?: Record<string, any>}): Promise<User | undefined> {
       
        const {
            id,
            filter = {},
        } = options;

        if (!id && !filter) return;

        try{
            const result = await NewSurrealDB.select({
                table: "user",
                id,
                filter
            });

            // Normalize to an array for easier handling
            const records: any[] = Array.isArray(result) ? result : [result];

            // Find the first valid record and convert to User
            const record = records.find((r) => r != null);
            if (!record) return undefined;

            const user = User.fromDbRecord(record);
            if(user && user instanceof User) return user;

        } catch (error) {
            Logger.warn("[UserService][getUser]", "Error in finding User", String(error));
            return undefined;
        }
    }

    static async updateUser(id: string, update) {
        const user = await SurrealDB.selectByProperty("user", "id", id);

        // Validate username
        if(!validateUserName(update.username)) {
            throw error("Invalid Username");
        }

        // Validate Firstname
        if(!validateUserName(update.firstname)) {
            throw error("Invalid Firstname");
        }

        // Validate Lastname
        if(!validateUserName(update.lastname)) {
            throw error("Invalid Lastname");
        }

        // Validate Birthdate
        if(update.Birthdate){
            if(validateBirthdate(update.birthdate)) {
                throw error("Invalid Birthdate");
            }
        }

        // Validate Pronouns
        if(!(typeof update.pronouns === "string")) {
            throw error("Invalid Pronouns");
        }

        // Sanitzise Update Data
        const sanitizedUpdate = {
            id: user.id,
            username: update.username,
            firstname: update.firstname,
            lastname: update.lastname,
            phone: update.phone,
            image: update.image,
            birthdate: update.birthdate, 
            pronouns: update.pronouns,
        }

        const dbUpdate = await SurrealDB.update(sanitizedUpdate);
        return dbUpdate;
    }

    static async updatePassword(id: string, passwdHash: string) {
        const user = await SurrealDB.selectByProperty("user", "id", id);

        if(!user) return false;

        const sanitizedUpdate = {
            id: id,
            passwdHash: passwdHash,
        }
        
        const dbUpdate = await SurrealDB.update(sanitizedUpdate);

        if(dbUpdate) {
            console.log(dbUpdate)
            return dbUpdate;
        }
        
        return false;
    }

    static async updateEmail(id: string, email: string) {
        const user = await SurrealDB.selectByProperty("user", "id", id);

        if(!user) return false;

        if(validateEmail(email)) {
            const sanitizedUpdate = {
                id: id,
                email: email,
            }

            const dbUpdate = await SurrealDB.update(sanitizedUpdate);

            if(dbUpdate) {
                console.log(dbUpdate)
                return dbUpdate;
            }
        } 
        return false;
    }

    static async deleteUser(id: string) {
        let user = await SurrealDB.selectByProperty("user", "id", id);
        user = User.fromDbRecord(user)

        if(!user || !id) return false;

        if(user.getRole("owner")) {
            Logger.security("[DB]", "Tried deleting Owner", "Tried deleting Owner");
            return false;
        } else {
            const result = await SurrealDB.delete("user", id)
            return result;
        }


    }

    static async GetPasswordHash(id: string): Promise<string> {
        const result = await UserService.getUser({id: id})

        console.log("RESULT: ", result)

        if(!result) {
            if(dev) console.error("[GetPasswordHash] User not found")
            return "";
        } 

        const dbUser = User.fromDbRecord(result)

        if(!dbUser || !(dbUser instanceof User)) {
            if(dev) console.error("[GetPasswordHash] Invalid user")
            return "";
        }

        return dbUser.getHash();
    }

    static toAuthUser(user:User) {
        return {
            id: user.getId(),
            name: user.getUsername(),
            email: user.getEmail(),
            image: user.getImage(),
        }
    }

    /**
     * Verifies whether a user has a specific role or returns all roles.
     * - If a role is provided, it checks if the user has it and returns a boolean.
     * - If no role is provided, it returns all roles assigned to the user.
     * @param user - A `User` instance or the user ID as a string.
     * @param role - The role to check (optional).
     * @returns `true` if the user has the specified role, `false` if not, or an array of roles if no specific role is provided.
     */
    static async verifyRole(user: User | string, role: Role = "") {

        let id;
        if(typeof user === "string") {
            id = user
        } else {
            id = user.getId();
        }

        // Get user
        let dbUser = await this.readUser("id", id)
        dbUser = User.fromDbRecord(dbUser);

        if (!dbUser) {
            throw new Error(`User with ID ${id} not found.`);
        }


        let roles = dbUser.getRole();

        if(role) {
            if(roles.includes(role)) return true
            return false
        }

        return dbUser.getRole()
    }

    static async getAuthor(userId: string, blogId?: string): Promise<User | undefined> {
        
        if(userId == "1234567890") {
            const testConfig: UserConfig = {
                id: "user:1234567890",
                username: "TestAuthor94",
                passwdHash: "",
                role: ["moderator"],
                email: "test@admin.com",
                firstname: "Teston ",
                lastname: "Authridge",
                image: "https://picsum.photos/600/600",
                pronouns: "he/him",
                
            }
            const testAuthor = User.generateUser(testConfig)
            return testAuthor;
        }

        // Get User
        const dbUser = await this.readUser("id", userId);

        // Error on empty user
        if(!dbUser) return undefined;

        // Error on user that cant be an author
        if(!dbUser.getRole("admin") && !dbUser.getRole("moderator")) return undefined;
        
        // Format to User obj
        let formatedUser = User.fromDbRecord(dbUser);
        
        // Sanitize
        formatedUser.sanitize()

        // Filter private info
        formatedUser.sanitizePrivate();

        return formatedUser;
    }
}







