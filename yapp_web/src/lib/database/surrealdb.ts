import { Logger, type LogEntry } from "$lib/utils/logger";
import Surreal, { RecordId, Table } from "surrealdb";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";

// Env vars
const DB_URL = `wss://${env.SURREAL_HOST}`;
const DB_USER = env.SURREAL_USER;
const DB_PASS = env.SURREAL_PASS;
const DB_NS = env.SURREAL_NAMESPACE;
const DB_DB = env.SURREAL_DATABASE;

const logContext = {
    ULR: DB_URL,
    USER: DB_USER,
    NS: DB_NS,
    DB: DB_DB,
}

// Validate env vars
if (!DB_URL || !DB_USER || !DB_PASS || !DB_NS || !DB_DB) {
    console.warn("Missing required SurrealDB environment variables.");
}

export class SurrealDB {
    protected static db: Surreal | undefined;
    protected static retry: number = 0;
    static clientPromise: Promise<Surreal> | null = null;

    /**
     * Returns a database instance
     * @param config 
     * @returns db
     */
    static async getDB(): Promise<Surreal | null> {

        if (!DB_URL) {
            console.warn("DB_URL not defined, skipping connection");
            return null;
        }

        if (!SurrealDB.db) {
            SurrealDB.db = new Surreal();

            try {
                await SurrealDB.db.connect(DB_URL, {
                    namespace: DB_NS,
                    database: DB_DB,
                    auth: {
                        username: DB_USER,
                        password: DB_PASS,
                    }
                });
                
                console.log("SurrealDB connected");
            
            } catch (err) {
                console.warn("SurrealDB connection failed, continuing without DB:", err);
                SurrealDB.db = null; 
            }
        }

        return SurrealDB.db;
    }

    /**
     * Returns a singleton SurrealDB client promise
     */
    static async getClient(): Promise<Surreal> {

        console.log("\ngetClient()")

        if (!SurrealDB.clientPromise) {
            SurrealDB.clientPromise = (async () => {
                SurrealDB.db = new Surreal();

                try {
                    console.log("Connecting to SurrealDB at", DB_URL);

                    await SurrealDB.db.connect(DB_URL, {
                        namespace: DB_NS,
                        database: DB_DB,
                        auth: {
                            username: DB_USER,
                            password: DB_PASS,
                        }
                    });

                    // Verify connection
                    if (SurrealDB.db.status !== "connected") {
                        throw new Error("Failed to connect to SurrealDB");
                    }

                    return SurrealDB.db;

                } catch (error) {
                    Logger.warn("[DB]", "Connection failed", String(error), { attempt: SurrealDB.retry, logContext });
                    throw error;
                }
            })();
        }

        return SurrealDB.clientPromise;
    }


    static serialize(data: any): any {
        if (data == null) return data;

        if (Array.isArray(data)) {
            return data.map((item) => this.serialize(item));
        }

        if (typeof data === "object") {
            // Handle SurrealDB record IDs (Thing)
            if ("tb" in data && "id" in data) {
                return `${data.tb}:${data.id}`;
            }

            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
                result[key] = this.serialize(value);
            }
            return result;
        }

        return data;
    }

    static async writeLog(entry: LogEntry) {
        const db = await SurrealDB.getDB();

        const result = await db.create("log", entry);

        // enforce retention
        const countRes = await db.query<[ { count: number } ]>(`SELECT count() AS count FROM log`);
        const count = countRes[0][0].count;

        if (count > 100_000) {
            await db.query(`
                DELETE FROM log 
                WHERE id INSIDE (
                    SELECT id, timestamp FROM log ORDER BY timestamp ASC LIMIT $limit
                )
            `, { limit: count - 100_000 });
        }

        return result;
    }

    /**
     * Create a Database Entry
     * @param obj - The object to create in the database
     * @param type - The type/table name in SurrealDB
     * @returns The created record
     */
    static async create<T extends Record<string, unknown>>(obj: T, type: string): Promise<unknown> {
        const db = await SurrealDB.getDB();
        
        try {
            // Remove the id property from the object if it exists
            const { id, ...data } = obj;
            
            // Remove dashes from id string (if id exists) so that no ⟨ ⟩ brackets are created
            const cleanId = id ? String(id).replace(/-/g, '') : undefined;

            // Create the record, use cleanId or let SurrealDB generate ID if cleanId is undefined
            const result = await db.create(
                cleanId ? new RecordId(type, cleanId) : type,
                data
            );
            
            return result;
        } catch (err) {
            console.error(`Failed to create ${type} record:`, err instanceof Error ? err.message : String(err));
            throw err;
        }
    }

    /**
     * Selects one or many Database Entries (optionally filtered)
     * @param table 
     * @param id 
     * @param filter (optional) — e.g. "message CONTAINS 'error'" or custom query text
     * @returns 
     */
    static async select(table: string, id: string | undefined = undefined, filter: string | undefined = undefined): Promise<any> {
        // Get Database
        const db = await SurrealDB.getDB();

        try {
            let result;

            if (id) {
                result = await db.select(new RecordId(table, id));

            } else if (filter) {
                const query = `SELECT * FROM ${table} WHERE ${filter}`;
                const res = await db.query(query);

                //Make sure that not an array is returned
                result = Array.isArray(res) ? res[0].result || res[0] : res;

            } else {
                result = await db.select(table);
            }

            return result;

        } catch (err) {
            console.error("Failed to select Object in SurrealDB:", err instanceof Error ? err.message : String(err));
        }
    }

    static async selectByProperty(table: string, property: string, value: any): Promise<any> {
        // Get Database
        const db = await SurrealDB.getDB();

        // Normalize id, add missing table prefix if missing
        if (property === "id" && typeof value === "string" && !value.startsWith(`${table}:`)) {
            value = `${table}:${value}`;
        }

        // Normalize quotes for strings
        if (typeof value === "string") {
            value = `"${value}"`;
        }

        try {
            // First query: exact match
            let query = `SELECT * FROM ${table} WHERE ${property} = ${value}`;
            let result = await db.query(query);

            // Retry with CONTAINS if necessary
            if (
                !result ||
                (Array.isArray(result) && result.length === 0) ||
                (Array.isArray(result) && result.length === 1 && Array.isArray(result[0]) && result[0].length === 0)
            ) {
                query = `SELECT * FROM ${table} WHERE ${property} CONTAINS ${value}`;
                result = await db.query(query);
            }


            // Handle the result
            if (Array.isArray(result) && result.length > 0) {
                // Flatten the array if necessary
                if (Array.isArray(result[0])) {
                    const flattenedResult = result[0];
                    // Return a single object if only one match, otherwise return the array
                    return flattenedResult.length === 1 ? flattenedResult[0] : flattenedResult;
                } else {
                    // If the result is already a single object, return it
                    return result;
                }
            }

            return null; 
        } catch (err) {
            console.error("Failed to select Object in SurrealDB:", err instanceof Error ? err.message : String(err));
            throw err; 
        }
    }

    static async selectPaginated(table: string, limit: number = 50, start: number = 0, filter: Record<string, any> = {}, search: Record<string, any> = {} ): Promise<{result: any[], total: number}> {
        filter = filter || {};
        search = search || {};

        const db = await SurrealDB.getDB();
        let query;

        // try {

            const limitString = limit != 0 ? `LIMIT ${limit}` : "";
            const startString = start != 0 ? `START ${start}` : "";

            const filterStrings = Object.entries(filter).map(([key, value]) => {
                if(typeof value == "string") {
                    return `${key} = s"${value}"`;
                }
                return `${key} = ${value}`;
            });

            // Designate filter clause or leave it empty
            const filterClause = filterStrings.length > 0 ? `${filterStrings.join(" AND ")}` : "";
        

            const searchStrings = Object.entries(search).map(([key, value]) => {
                if(typeof value == "string") {
                    return `${key} CONTAINS s"${value}"`;
                }
                return `${key} CONTAINS ${value}`;
            })

            const searchClause = searchStrings.length > 0 ? `${searchStrings.join(" OR ")}` : "";

            let whereClause = "";

            // const whereClause = `${filterClause} (${searchClause})` // filterClause + searchClause

            if(filterClause && searchClause) whereClause = `WHERE ${filterClause} AND (${searchClause})`;
            else if(filterClause) whereClause = `WHERE ${filterClause}`;
            else if(searchClause) whereClause = `WHERE ${searchClause}`;


            // Get Paginated Data

            if(searchClause || filterClause) {
                query = `SELECT * FROM ${table} ${whereClause} ORDER BY timestamp DESC ${limitString} ${startString}`;
            } else {
                query = `SELECT * FROM ${table} ORDER BY timestamp DESC ${limitString} ${startString}`
            }


            let total = await db.query(
                `SELECT count() FROM ${table} GROUP BY count`
            )

            total = total[0][0].count;
            
            let result = await db.query(query)
            result = result[0]
            return {result: result, total: total};
    }

    /**
     * Deletes one or many Database Entries
     * @param table 
     * @param id 
     * @returns result
     */
    static async delete(table: string, id:string|undefined=undefined): Promise<any> {
        // Get Database
        const db = await SurrealDB.getDB();

        try {        
            let result; 

            // Delete specific result
            if(id) {
                result = await db.delete(new RecordId(table, id))

                console.log("DEEP: ", result, "\n", table, id)

            // Delete entire table 
            } else {
                 result = await db.delete(table)
            }


            return result;

        }catch (err) {
            console.error("Failed to delete Object in SurrealDB:", err instanceof Error ? err.message : String(err));
        }
    }

    static async deleteByProperty(table:string, property: string, value:any): Promise<any> {
        // Get Database
        const db = await SurrealDB.getDB();

        if(typeof value === "string" ) {
            value = `"${value}"`
        }

        try {        
            const query = `DELETE FROM ${table} WHERE ${property} = ${value}`
            let result = await db.query(query)

            // Make sure that the result is not passed along as an Array
            let iterations = 0;
            while (Array.isArray(result) && iterations < 5) {
                result = result[0];
                iterations++;
            }

            return result;

        }catch (err) {
            console.error("Failed to select Object in SurrealDB:", err instanceof Error ? err.message : String(err));
        }
    }

    static async deleteAccountsByUserId(id: string) {
        // Get Database
        const db = await SurrealDB.getDB();

        try {
            const query = `
                DELETE FROM account WHERE userId == s'user:⟨${id}⟩';
            `;
            const result = await db.query(query)
            return result
        } catch (err) {
            console.error("Failed to delete Account by UserId in SurrealDB:", err instanceof Error ? err.message : String(err));
        }

    }

    static async update(dbObj: any) {
        if (!dbObj.id) throw new Error("Object id is required");
        const db = await SurrealDB.getDB();

        const { id, ...cutObj } = dbObj;

        try {
            const query = `UPDATE type::thing($id) CONTENT $data`;
            const [updatedObj] = await db.query(query, { id, data: cutObj });

            if (updatedObj) return updatedObj;
            throw new Error("Obj not updated");
        } catch (err) {
            console.error(`Failed to update object ${dbObj.id}:`, err);
        }
    }

    static async query(query: string) {
        const db = await SurrealDB.getDB();

        try {
            const result = await db.query(query);
            return result;
        } catch (error) {
            console.error(`Failed to run query:\n${query}\n`);
        }
    }

}

    