import { dev } from "$app/environment";
import {v4 as uuidv4} from "uuid";

export type Role = "owner" | "user" | "admin" | "moderator" | undefined | "";

export interface Changelog {
    time: Date,
    propertyName: string,
    previousValue: string | Date | number | Role | Boolean,
    newValue: "string" | Date | number | Role | Boolean,
}

export interface UserConfig {
    id?: string;
    username: string;
    passwdHash: string;
    role?: Role[];
    email?: string;
    emailVerified?: boolean;
    firstname?: string;
    lastname?: string;
    image?: string;
    phone?: string;
    birthdate?: Date;
    pronouns?: string;
    publicInfo?: PublicInfo;
    changelog?: Changelog[]
}

export interface PrivateInfo {
    username: string,
    role: Role[],
    email: string | undefined,
    emailVerified: boolean, 
    firstname?: string | undefined,
    lastname?: string | undefined,
    image?: string | undefined,
    publicInfo: PublicInfo,
    initials: string | undefined,
}

export interface PublicInfo {
    initials?: string,
}

export class User {
    private readonly id: string;

    private constructor(
        id:string,
        private username: string,
        private passwdHash: string | undefined = undefined,
        private role: Role[] = [],
        private email: string | undefined = undefined,
        private emailVerified: boolean | Date = false,
        private firstname: string | undefined = undefined,
        private lastname: string | undefined = undefined,
        private image: string | undefined = undefined,
        private publicInfo: PublicInfo = {},
        private initials: string | undefined = undefined,
        private phone: string | undefined = undefined,
        private birthdate: Date | undefined = undefined,
        private pronouns: string | undefined = undefined,
        private changelog: Changelog[] = [],
    ) {
        this.id = id;
    }


    /**
     * Generates a completly new User
     * 
     * @param userConfig - User Configuration Information 
     * @returns newUser - New User Object
    */
    static generateUser(userConfig: UserConfig): User {

        // Throw error on missing ID or Username
        if (!userConfig.username) {
            // throw new Error("User must have at least an username.");
            console.error("User must have at least an username.")
        }
        
        let newId = userConfig.id ? userConfig.id : uuidv4();

        const newUser = new User(
            newId,
            userConfig.username,
            userConfig.passwdHash,
            userConfig.role || [],
            userConfig.email,
            userConfig.emailVerified || false,
            userConfig.firstname,
            userConfig.lastname,
            userConfig.image,
            userConfig.publicInfo || {},
            "", // Leave initials empty, will be set below
            userConfig.phone,
            userConfig.birthdate,
            userConfig.pronouns,
            userConfig.changelog,
        );

        newUser.generateInitials()

        return newUser
    }

    static fromDbRecord(record: any) {
        try {
            if (!record) throw new Error("Cannot create User from undefined record");

            let formatedId: string;

            if(record.id && typeof record.id == "object" && "tb" in record.id && "id" in record.id) {
                formatedId = `${record.id.tb}:${record.id.id}`;
            } else if(typeof record.id == "string") {
                formatedId = record.id;
            } else {
                throw new Error(`Invalid record.id format: ${JSON.stringify(record)}`);
            }

            record.id = formatedId;
            return this.generateUser(record);

        } catch(error) {
            console.error("fromDbRecord failed: ", error)
            return;
        }
    }

    toJSON(): UserConfig {

        const jsonUser: UserConfig = {
            id: this.id,
            username: this.username,
            passwdHash: "", // Dont return passwdHash
            role: this.role,
            email: this.email,
            emailVerified: this.emailVerified,
            firstname: this.firstname,
            lastname: this.lastname,
            image: this.image,
            phone: this.phone,
            birthdate: this.birthdate,
            pronouns: this.pronouns,
            publicInfo: this.publicInfo,
            changelog: this.changelog,
        }

        return jsonUser; 
    }

    static fromJSON(userConfig: UserConfig): User {
        const user = User.generateUser(userConfig);
        return user;
    }


    //#region Getters

    getId(): string {
        return this.id;
    }

    getUsername(): string {
        return this.username;
    }

    getFirstname(): string {
        if(!this.firstname) return "";
        return this.firstname;
    }

    getLastName(): string {
        if(!this.lastname) return "";
        return this.lastname;
    }

    getInitials(): string {
        if(!this.initials) {
            this.generateInitials()
        }

        if(!this.initials) {
            return "";
        }

        return this.initials;
    }

    getImage(): string {
        if(!this.image) return ""
        return this.image;
    }

    getEmail(): string {
        if(!this.email) return "";
        return this.email;
    }

    getEmailVerified(): boolean | Date {
        if(this.emailVerified) {
            return this.emailVerified;
        }
        return false;
    }

    getPhone(): string {
        if(!this.phone) return "";
        return this.phone;
    }

    getBD(): Date | undefined {
        if(!this.birthdate) return undefined;
        return this.birthdate;
    }

    getPronouns(): string | undefined {
        if(!this.pronouns) return "";
        return this.pronouns;
    }

    getRole(role?: Role): Role[] | boolean {
        if(role) {
            if(this.role.includes(role)) return true;
            return false;
        }
        return this.role;
    }

    getHash(): string {
        if(this.passwdHash) {
            return this.passwdHash
        }
        if(dev) console.error("[getHash] No Password Hash found")
        return "";
    }

    //#endregion Getters


    //#region Setters

    update(userConfig: UserConfig): User {

        const properties: Array<keyof UserConfig> = [
            "id",
            "username",
            "passwdHash",
            "role",
            "email",
            "emailVerified",
            "firstname",
            "lastname",
            "image",
            "phone",
            "birthdate",
            "pronouns",
            "publicInfo",
            "changelog",
        ]

        const currentConfig: UserConfig = this.toJSON();

        properties.forEach(property => {
            const currentProperty = currentConfig[property];
            const newProperty = userConfig[property];

            // Check if both properties are undefined, which means they are the same
            if (currentProperty === undefined && newProperty === undefined) {
                return;
            }

            // Check if one of the properties is undefined, which means they are different
            if (currentProperty === undefined || newProperty === undefined) {
                console.log(`Difference in ${property}: one is defined and the other is not.`);
                return;
            }

            // Compare the values
            if (currentProperty !== newProperty) {
                if (property === "birthdate" && currentProperty instanceof Date && newProperty instanceof Date) {
                    if (currentProperty.getTime() !== newProperty.getTime()) {
                        console.log(`Difference in ${property}:`, currentProperty, newProperty);
                    }
                } else if (Array.isArray(currentProperty) && Array.isArray(newProperty)) {
                    if (JSON.stringify(currentProperty) !== JSON.stringify(newProperty)) {
                        console.log(`Difference in ${property}:`, currentProperty, newProperty);
                    }
                } else {
                    console.log(`Difference in ${property}:`, currentProperty, newProperty);
                }
            }
        })


        const updatedUser = User.generateUser(userConfig)

        return updatedUser;
    }

    setEmail(email: string) {
        if(validateEmail(email)) {
            this.email = email;
            return email
        }
        return false;
    }



    //#endregion Setters



    sanitize() {
        this.passwdHash = ""; // Hide Passwdhash
    }

    sanitizeAuthor() {
        return {
            id: this.id,
            username: this.username,
            firstname: this.firstname,
            lastname: this.lastname,
            image: this.image,
            initials: this.initials,
            pronouns: this.pronouns,
            role: this.role,
        }
    }

    sanitizePrivate() {
        this.email = "";
        this.emailVerified = false;
        this.birthdate = undefined;
        this.role = [];
        this.phone = undefined;
        this.changelog = [];
        this.passwdHash = "";
    }


    generateInitials(): void {
        let initials: string | undefined;

        // Get Initials from first and lastname
        if(this.firstname && this.lastname) {
            initials = this.firstname.charAt(0).toUpperCase() + this.lastname.charAt(0).toUpperCase();
        
        // Get Initials from Username
        }else if(this.username) {
            const usernameParts = this.username.split(/[_. ]/); // Split by common separators
            
            if (usernameParts.length >= 2) {
                initials = usernameParts[0].charAt(0).toUpperCase() + usernameParts[1].charAt(0).toUpperCase();
            } else {
                initials = this.username.substring(0, 2).toUpperCase();
            }

        // Get Initials from Email
        }else if(this.email) {
            const emailParts = this.email.split(/[_.@]/); // Split by common separators in email        
            
            if(emailParts.length >= 2) {
                initials = emailParts[0].charAt(0).toUpperCase() + emailParts[1].charAt(0).toUpperCase();
            }
        }

        if(initials) {
            this.initials = initials;

            // Update public initials, if there are any
            if(this.publicInfo.initials) {
                this.publicInfo.initials = initials;
            }
        }

    }
}












/**
 * Generates a plain text version of an email for signing in.
 * This is used as a fallback for email clients that do not support HTML.
 * @param url The URL to sign in.
 * @param host The host domain for the sign-in link.
 * @returns A plain text string with sign-in instructions and the URL.
 */
export function toText(url: string, host: string) {
    return `Sign in to ${host}\n${url}\n\n`
}

/**
 * Generates an HTML version of an email for signing in.
 * This includes styled content with a button linking to the sign-in URL.
 * @param url The URL to sign in.
 * @param host The host domain for the sign-in link.
 * @returns An HTML string with styled sign-in instructions and a button linking to the URL.
 */
export function toHTML( url: string, host: string ) {
    const escapedHost = host.replace(/\./g, "&#8203;.")
    
    const brandColor = "#346df1"
    const color = {
        background: "#f9f9f9",
        text: "#444",
        mainBackground: "#fff",
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText: "#fff",
    }
 
    return `
        <body style="background-color: ${color.background}; font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: ${color.mainBackground}; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <tr>
                    <td style="padding: 20px; text-align: center; background-color: ${brandColor}; border-radius: 10px 10px 0 0;">
                        <h1 style="color: ${color.buttonText}; margin: 0; font-size: 24px;">Welcome to ${escapedHost}</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; text-align: center;">
                        <h2 style="color: ${color.text}; font-size: 20px; margin-bottom: 20px;">Verify Your Email Address</h2>
                        <p style="color: ${color.text}; font-size: 16px; line-height: 24px; margin-bottom: 20px;">
                            Thank you for signing up! To ensure the security of your account and access all features, please verify your email address by clicking the button below.
                        </p>
                        <table border="0" cellspacing="0" cellpadding="0" align="center">
                            <tr>
                                <td align="center" style="border-radius: 5px; background-color: ${color.buttonBackground};">
                                    <a href="${url}" target="_blank"
                                    style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 12px 24px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                                        Verify Email Address
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; text-align: center; font-size: 14px; color: ${color.text}; line-height: 20px;">
                        <p>If you did not request this verification, you can safely ignore this email.</p>
                        <p>For any questions or assistance, please contact our support team at <a href="mailto:support@${escapedHost}" style="color: ${brandColor}; text-decoration: none;">support@${escapedHost}</a>.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; text-align: center; font-size: 12px; color: ${color.text}; background-color: ${color.background}; border-radius: 0 0 10px 10px;">
                        <p>&copy; ${new Date().getFullYear()} ${escapedHost}. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        </body>
    `
}


