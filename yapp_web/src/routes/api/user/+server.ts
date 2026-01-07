import { SurrealDB } from "$lib/database/surrealdb";
import { Logger } from "$lib/utils/logger";
import { UserConfig } from "$lib/utils/auth/User";
import { User } from "$lib/utils/auth/User";
import { validateBirthdate, validateEmail, validateUserName } from "$lib/utils/auth/authUtils";
import { UserService } from "$lib/utils/authUtilsSS";
import { emailManager } from "$lib/utils/emails";
import type { RequestHandler } from "@sveltejs/kit";
import { hash } from 'argon2';
import { randomUUID } from "crypto";


// Get user info
export const GET: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)
    
    try {    


        if (!session?.user || !dbUser) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }
        
        // Get Search Parameters
        const params = {
            id: event.url.searchParams.get("userId") ?? "",
            username: event.url.searchParams.get("userName") ?? "",
            role: event.url.searchParams.get("role") ?? "",
            phone: event.url.searchParams.get("phone") ?? "",
            email: event.url.searchParams.get("email") ?? "",
        }

        let userResult: User | User[] | undefined = undefined;

        // Determine Authorization Level
        const isPrivileged = dbUser.getRole("admin") || dbUser.getRole("moderator");

        // Unauthorized Users can only search for themselves
        if(!isPrivileged) {
            dbUser.sanitize()
            return new Response(JSON.stringify({ user: dbUser }), { status: 200 })
        }

        const hasFilters = Object.values(params).some((Value) => Value);
        
        // Get all users if no filter is provided
        if(!hasFilters) {
            userResult = await UserService.getUser();
        }

        // Let only admins and moderators get all or specific users
        if(params.id == null && params.username == null && params.role == null && params.phone == null && params.email == null && isPrivileged) {
            userResult = await UserService.getUser();
        } else {
            const filters: string[] = [];

            for(const [key, value] of Object.entries(params)) {
                if(value) {
                    filters.push(`${key} = "${value}"`);
                }
            }
            const searchConditions = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
            const query = `SELECT * FROM user ${searchConditions}`

            const db = await SurrealDB.getDB();
            const result = await db.query(query);

            userResult = Array.isArray(result) ? result.flat() : [];
        }

        if (!Array.isArray(userResult)) {
            userResult = [];
        }

        // Sanitize all returned users
        userResult = userResult.map((record) => {
            const user = User.fromDbRecord(record);
            user.sanitize();
            return user;
        });

        if (!userResult) {
            return new Response(JSON.stringify({ users: [] }), { status: 200 });
        }

        return new Response(JSON.stringify({ users: userResult}), { status: 200 })
    
    } catch (error) {
        Logger.warn("[API][USER]", "Getting Users Failed", String(error), {}, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""})
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

// Create new User
export const POST: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    let hashedPassword = undefined;
    let userInfo: UserConfig;
    let newUser: User;
    

    try {

        // Extract body
        let {username, password, role, email, firstname, lastname, phone, birthdate, pronouns } = await event.request.json()

        // Throw if no identifier is given
        if(!username && !email) {
            return new Response(JSON.stringify({ error: "Missing Identifier" }), { status: 400 }) 
        }

        // Check if user with that email already exists
        if(email){
            if(await UserService.getUser("email", email) != undefined) {
                return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 }) 
            }
        }

        // Check if user with that username already exists
        if(username){
            if(await UserService.readUser("username", username) != undefined) {
                return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 }) 
            }
        }

        // Verify Inputs

        let usernameValid;
        let emailValid;
        let birthdateValid;

        // Validate Email
        if(email) {
            emailValid = validateEmail(email);
            
            if(!emailValid) {
                return new Response(JSON.stringify({ error: "Email Invalid" }), { status: 400 })
            }
        }

        // Validate Username
        if(username) {
            usernameValid = validateUserName(username);

            if(!usernameValid) {
                return new Response(JSON.stringify({ error: "Username Invalid" }), { status: 400 }) 
            }
        }

        // Validate Birthdate
        if(birthdate) {
            birthdateValid = validateBirthdate(birthdate);
            
            if(!birthdateValid) {
                return new Response(JSON.stringify({ error: "Birthdate Invalid" }), { status: 400 })
            } else {
                birthdate = new Date(birthdate).toISOString();
            }
        }

        // Hash password if given
        if(password) {
            hashedPassword = await hash(password)

            if(!hashedPassword || hashedPassword == undefined) {
                Logger.warn("[API][USER]", "Error hashing Password", "Error hashing Password", {}, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""});
                return new Response(JSON.stringify({error: "Error hashing Password"}), { status: 500 });
            }
        }

        let isAuthorized = dbUser?.getRole("admin");

        // Authenticated Path
        if(isAuthorized && dbUser) {

            userInfo = {
                username: username,
                passwdHash: hashedPassword,
                role: role,
                email: email,
                emailVerified: false,
                firstname: firstname,
                lastname: lastname,
                phone: phone,
                birthdate: birthdate,
                pronouns: pronouns,
            }

            // Log user creation attempt
            const context = {username: username, email: email, role: role, firstname: firstname, lastname: lastname };
            Logger.info("[API][USER]", "Creating new User", context, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""});

        } else { // Self-Creation

            userInfo = {
                username: username,
                passwdHash: hashedPassword,
                role: ["user"],
                email: email,
                emailVerified: false,
                firstname: firstname,
                lastname: lastname,
                phone: phone,
                birthdate: birthdate,
                pronouns: pronouns,
            }

            if(dbUser) {
                Logger.security("[API][USER]", "Error creating User", "Already existing user tried to create a new user", {userInfo: userInfo}, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""});
                return new Response(JSON.stringify({error: "Can not create a new user"}), { status: 500 });
            }

        }

        newUser = User.generateUser(userInfo)
        const result = await UserService.createUser(newUser)
        const context = {username: username, email: email, role: role, firstname: firstname, lastname: lastname };

        if(result) {
            Logger.info("[API][USER]", "Successfully created new User", context, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""});
            return new Response(JSON.stringify({ message: "User created successfully" }), { status: 201 });
        } else {
            Logger.warn("[API][USER]", "User creation failed", "User creation failed", context, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""});
            return new Response(JSON.stringify({ error: "User creation failed" }), { status: 500 });
        }

    } catch (error) {
        Logger.warn("[API][USER]", "User creation failed", String(error), {}, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""})
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

// Update User
export const PUT: RequestHandler = async ( event ) => {
    
    console.log("PUT")

    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    // Only loged in users can update
    if(!dbUser) {
        Logger.security("[API][USER]", "Unauthorized Update Attempt", "Unauthorized Update Attempt", { event: event })
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    console.log("1")

    let hashedPassword = undefined;
    let userInfo: Partial<UserConfig> = {};
    let selfUpdate: boolean = false;

    try {

        // Extract body
        let {updateUserId, token, username, password, role, email, firstname, lastname, phone, birthdate, pronouns } = await event.request.json()

        // Self update if no other user is passed
        if(!updateUserId) {
            selfUpdate = true;
            updateUserId = dbUser.getId()
        }

        // Get the user to be updated
        const updateUser = await UserService.readUser("id", updateUserId);

        console.log("2")

        // Error on missing user
        if(!updateUser) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        // Validate Email
        if(email) {
            if(!validateEmail(email)) {
                return new Response(JSON.stringify({ error: "Email Invalid" }), { status: 400 })
            }
        }

        // Validate Username
        if(username) {
            if(!validateUserName(username)) {
                return new Response(JSON.stringify({ error: "Username Invalid" }), { status: 400 }) 
            }
        }

        // Validate Birthdate
        if(birthdate) {
            if(!validateBirthdate(birthdate)) {
                return new Response(JSON.stringify({ error: "Birthdate Invalid" }), { status: 400 })
            } else {
                birthdate = new Date(birthdate).toISOString();
            }
        }

        // Validate Role
        const allowedRoles = ["user", "moderator"];
        if(role && !allowedRoles.includes(role)) {
            return new Response(JSON.stringify({ error: "Invalid Role" }), { status: 400 });
        }

        console.log("3")

        // Hash password if given
        if(password) {
            hashedPassword = await hash(password)

            if(!hashedPassword || hashedPassword == undefined) {
                Logger.warn("[API][USER]", "Error hashing Password", "Error hashing Password", {}, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""});
                return new Response(JSON.stringify({error: "Error hashing Password"}), { status: 500 });
            }
        }

        // Self update
        if(selfUpdate) {
            userInfo.id = updateUserId; // Set Id for update function 
            if(username) userInfo.username = username;
            if(firstname) userInfo.firstname = firstname;
            if(lastname) userInfo.lastname = lastname;
            if(phone) userInfo.phone = phone;
            if(birthdate) userInfo.birthdate = new Date(birthdate);
            if(pronouns) userInfo.pronouns = pronouns;

            // Password updates requireing token
            if(password) {
                console.log("password")
                if(token) {
                    // Get Token
                    const token = await SurrealDB.selectByProperty("token", "userId", dbUser.getId())
                    
                    // Delete Token from DB
                    await SurrealDB.delete("token", token.id)

                    // Verify existance
                    if(!token || !token.code) {
                        return new Response(JSON.stringify({error: "Token not found"}), { status: 404 })
                    }

                    // Verify token
                    if(token == token.code) {
                        // Set new Password
                        userInfo.passwdHash = token.newPassword;
                    } else {
                        // Update Token
                        const newToken = token;
                        newToken.attempt += 1;

                        // Alert and block on repeated attempts
                        if(newToken.attempt >= 3) {
                            Logger.security("[TOKEN]", "Repeated unsuccessful password reset attempts", "A user repeatedly tried to reset a password unsuccesssful", {attempt: newToken.attempt}, {id: dbUser.getId(), email: dbUser.getEmail()})
                            // TODO: BLOCK
                        }

                        // Store updated Token
                        await SurrealDB.create(newToken, "token")

                        return new Response(JSON.stringify({error: "Invalid Code"}), { status: 403 });
                    }
                } else {
                    // Create token request
                    const newToken = await UpdateToken.generateToken(dbUser.getId(), "updatePassword", hashedPassword)

                    // Verify Token
                    if(!newToken || !newToken.code) {
                        Logger.warn("[TOKEN]", "Error creating Token", "Error creating Token", {type: "updatePassword"}, {id: dbUser.getId(), email: dbUser.getEmail()})
                        return new Response(JSON.stringify({error: "Error creating Token"}), { status: 500 })
                    }

                    // Send Verification Email
                    emailManager.sendTokenEmail("YAPP", dbUser.getEmail(), "updatePassword", newToken.code)
                }
            }

            // Email updates requireing token
            if(email) {
                console.log("email")
                if(token) {
                    // Get Token
                    const token = await SurrealDB.selectByProperty("token", "userId", dbUser.getId());

                    // Delete Token from DB
                    await SurrealDB.delete("token", token.id);

                    // Verify existance
                    if(!token || !token.code) {
                        return new Response(JSON.stringify({error: "Token not found"}), { status: 404 })
                    }

                    // Verify token
                    if(token == token.code) {
                        // Set new Email
                        userInfo.email = token.newEmail;
                    } else {
                        // Update Token
                        const newToken = token
                        newToken.attempt += 1;

                        // Alert and block on repeated attempts
                        if(newToken.attempt >= 3) {
                            Logger.security("[TOKEN]", "Repeated unsuccessful email reset attempts", "A user repeatedly tried to reset a email unsuccesssful", {attempt: newToken.attempt}, {id: dbUser.getId(), email: dbUser.getEmail()})
                            // TODO: BLOCK
                        }

                        // Store updated Token
                        await SurrealDB.create(newToken, "token");

                        return new Response(JSON.stringify({error: "Invalid Code"}), { status: 403 });
                    }
                }else {
                    // Create token request
                    const newToken = await UpdateToken.generateToken(dbUser.getId(), "updateEmail", hashedPassword)

                    // Verify Token
                    if(!newToken || !newToken.code) {
                        Logger.warn("[TOKEN]", "Error creating Token", "Error creating Token", {type: "updateEmail"}, {id: dbUser.getId(), email: dbUser.getEmail()})
                        return new Response(JSON.stringify({error: "Error creating Token"}), { status: 500 })
                    }

                    // Send Verification Email
                    emailManager.sendTokenEmail("YAPP", dbUser.getEmail(), "updateEmail", newToken.code)
                }
            }
        } else {
            console.log("NOT IMPLEMENTED")
            return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
        }

        console.log("4")

        // Update
        console.log("user info: ", userInfo)
        const update = await SurrealDB.update(userInfo);
        
        // Sanitize Logging Context
        userInfo.passwdHash = "redacted";

        if(update) {
            Logger.info("[API][USER]", "User successfully updated")
            return new Response(JSON.stringify({ message: "Successfully Updated"}), { status: 200 });
        } else {
            Logger.warn("[API][USER]", "Unexpected Error on User Update", "Unexpected Error on User Update", {update: userInfo}, {id: dbUser.getId(), email: dbUser.getEmail()});
            return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
        }

    } catch (error) {
        Logger.warn("[API][USER]", "User update failed", String(error), {}, {id: dbUser?.getId() || "", email: dbUser?.getEmail() || ""})
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

// Delete User
export const DELETE: RequestHandler = async ( event ) => {
    
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    // Only loged in users can delete
    if(!dbUser) {
        Logger.security("[API][USER]", "Unauthorized Delete Attempt", "Unauthorized Delete Attempt", { event: event })
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    // Imediat Fulldelete
    const fullDelete = event.url.searchParams.get("fullDelete") === "true";
    const userId = event.url.searchParams.get("userId") ?? "";

    // Missing User Id
    if(!userId) {
        return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
    }

    // Get to be deleted user
    const deleteUser = await UserService.getUser("id", userId);
    
    // Error on non existing user
    if(!deleteUser) {
        return new Response(JSON.stringify({ error: "User does not exist" }), { status: 404 });
    }
    
    // Do not delete several users
    // Should actually not be possible
    if(Array.isArray(deleteUser)) {
        return new Response(JSON.stringify({ error: "Cannot delete several Users at once" }), { status: 400 })
    }

    // Sanitize delete User
    deleteUser.sanitize()

    // Cannot delete owner
    if(deleteUser.getRole("owner")) {
        Logger.security("[API][USER]", "Tried deleting Owner", "Tried deleting Owner", {}, {id: dbUser.getId(), email: dbUser.getEmail()})
        return new Response(JSON.stringify({ error: "Error deleting User"}), { status: 500 })
    }

    let result;

    // Owner Delete - Always allow
    if(dbUser.getRole("owner")) {
        result = await UserService.deleteUser(userId);

        console.log("RESULT: ", result)
        
        if(result) {
            Logger.info("[API][USER]", "Successfully Deleted User", {deletedUser: deleteUser}, {id: dbUser.getId(), email: dbUser.getEmail()});
            return new Response(JSON.stringify({ message: "Successfully deleted User ", user: deleteUser }), { status: 200 })
        } else {
            Logger.warn("[API][USER]", "Error deleting User", "Error deleting User", {deletedUser: deleteUser}, {id: dbUser.getId(), email: dbUser.getEmail()})
            return new Response(JSON.stringify({ error: "Error deleting User" }), { status: 500 }) 
        }
    }

    // Allow admins to delete mods
    if(dbUser.getRole("admin")) {
        if(deleteUser.getRole("owner") || deleteUser.getRole("admin")) {
            // Logger Todo
            return new Response(JSON.stringify({ error: "Error deleting User"}), { status: 500 })
        }

        result = await UserService.deleteUser(userId);

        if(result) {
            Logger.info("[API][USER]", "Successfully Deleted User", {deletedUser: deleteUser}, {id: dbUser.getId(), email: dbUser.getEmail()});
            return new Response(JSON.stringify({ message: "Successfully deleted User ", user: deleteUser }), { status: 200 })
        } else {
            Logger.warn("[API][USER]", "Error deleting User", "Error deleting User", {deletedUser: deleteUser}, {id: dbUser.getId(), email: dbUser.getEmail()})
            return new Response(JSON.stringify({ error: "Error deleting User" }), { status: 500 }) 
        }
    }

    // Allow mods to delete users
    if(dbUser.getRole("moderator")) {
        if(!deleteUser.getRole("user")) {
            // Logger Todo
            return new Response(JSON.stringify({ error: "Error deleting User"}), { status: 500 })
        }

        result = await UserService.deleteUser(userId);

        if(result) {
            Logger.info("[API][USER]", "Successfully Deleted User", {deletedUser: deleteUser}, {id: dbUser.getId(), email: dbUser.getEmail()});
            return new Response(JSON.stringify({ message: "Successfully deleted User ", user: deleteUser }), { status: 200 })
        } else {
            Logger.warn("[API][USER]", "Error deleting User", "Error deleting User", {deletedUser: deleteUser}, {id: dbUser.getId(), email: dbUser.getEmail()})
            return new Response(JSON.stringify({ error: "Error deleting User" }), { status: 500 }) 
        }
    }

    // User selfe delete
    if(dbUser.getRole("user")) {

        if (dbUser.getId() !== userId) {
            Logger.security("[API][USER]", "User tried deleting another account", "", {}, { id: dbUser.getId(), email: dbUser.getEmail() });
            return new Response(JSON.stringify({ error: "Error deleting User" }), { status: 500 }) 
        }

        result = await UserService.deleteUser(dbUser.getId())

        if(result) {
            Logger.info("[API][USER]", "User Successfully deleted own Account", {deletedUser: deleteUser}, {id: dbUser.getId(), email: dbUser.getEmail()});
            return new Response(JSON.stringify({ message: "Successfully deleted User ", user: deleteUser }), { status: 200 })
        } else {
            Logger.warn("[API][USER]", "Error deleting User", "Error deleting User", {deletedUser: deleteUser}, {id: dbUser.getId(), email: dbUser.getEmail()})
            return new Response(JSON.stringify({ error: "Error deleting User" }), { status: 500 }) 
        }

    }

    // No matching Role
    // Should be impossible
    Logger.error("[API][USER]", "No matching User Role", "No matching User Role", {deleteUser: deleteUser, dbUser: dbUser}, {id: dbUser.getId(), email: dbUser.getEmail()})
    return new Response(JSON.stringify({ error: "Error deleting User" }), { status: 500 }) 

}
