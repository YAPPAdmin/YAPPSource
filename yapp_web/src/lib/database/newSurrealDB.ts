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

// Validate env vars
if (!DB_URL || !DB_USER || !DB_PASS || !DB_NS || !DB_DB) {
    console.warn("Missing required SurrealDB environment variables.");
}

export class SurrealDB {
    protected static db: Surreal | undefined;
    
    static async getDB(): Promise<Surreal | undefined> {
        if (!DB_URL) {
            console.warn("DB_URL not defined, skipping connection");
            SurrealDB.db = undefined; 
            return;
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
                SurrealDB.db = undefined; 
            }
        }
        return SurrealDB.db;
    }


    static async create(options: {table: string; data: Record<string, any>}, userId?: string): Promise<any[]> {
        const { table, data } = options;

        const db = await SurrealDB.getDB();
        if (!db) throw new Error("SurrealDB not connected");

        try {
            // Remove the id property from the object if it exists
            const { id, ...content } = data;
            
            // Remove dashes from id string (if id exists) so that no ⟨ ⟩ brackets are created
            const cleanId = id ? String(id).replace(/-/g, '') : undefined;

            const result = await db.create(
                cleanId ? new RecordId(table, cleanId): table,
                content
            )

            return Array.isArray(result) ? result : [result];
        
        } catch(error) {
            Logger.warn("[DB][SELECT]", "CREATE failed", String(error), {table: table, data: data}, {id: String(userId)});
            if(dev) console.warn(`[DB][CREATE] CREATE failed - ${error}`)
            return [];
        }
    }


    /**
     * Select Function
     * @param options tabel, id, filter, search, pagination limit, pagination start, order
     * @param userId (optional) ID of performing user
     * @returns Array of matching rows, even if empty
     */
    static async select(options: {table: string; id?: string; filter?: Record<string, any>; search?: Record<string, any>; limit?: number; start?: number; orderBy?: string;}, userId?: string): Promise<any[]> {
        const {
            table,
            id,
            filter = {},
            search = {},
            limit = undefined,
            start = undefined,
            orderBy = "timestamp DESC",
        } = options;

        const db = await SurrealDB.getDB();
        if (!db) throw new Error("SurrealDB not connected");

        let query = "";

        try {

            // Select by id
            if (id) {
                let tableId = id;
                let bareId = id;

                if (id.includes(":")) {
                    // Split into table and bare id if needed
                    [tableId, bareId] = id.split(":");
                }

                const recordId = new RecordId(tableId, bareId);
                const result = await db?.select(recordId);

                if (!result) return [];
                return Array.isArray(result) ? result : [result];
            }

            // Filter Parts
            const filterParts = Object.entries(filter).map(([key, value]) =>
                typeof value === "string"
                    ? `${key} = "${value}"`
                    : `${key} = ${value}`
            );

            // Search Parts
            const searchParts = Object.entries(search).map(([key, value]) => 
                typeof value == "string"
                    ? `${key} CONTAINS "${value}"`
                    : `${key} CONTAINS ${value}`
            )

            let whereClause = "";

            // Build WHERE clause
            if(filterParts.length && searchParts.length) {
                whereClause = `WHERE ${filterParts.join(" AND ")} AND (${searchParts.join(" OR ")})`;
            } else if(filterParts.length) {
                whereClause = `WHERE ${filterParts.join(" AND ")}`;
            } else if(searchParts.length) {
                whereClause = `WHERE ${searchParts.join(" OR ")}`;
            }

            // Define Pagination start and limit
            const limitClause = limit ? `LIMIT ${limit}` : "";
            const startClause = start ? `START ${start}` : "";

            // Build query
            query = `
                SELECT * FROM ${table}
                ${whereClause}
                ORDER BY ${orderBy}
                ${limitClause}
                ${startClause}
            `.trim()

            // Execure SELECT
            const result = await db?.query(query);
            const data = Array.isArray(result) ? result[0] : result;

            return Array.isArray(data) ? data: [data];

        } catch(error) {
            Logger.warn("[DB][SELECT]", "SELECT failed", String(error), {query: query}, {id: String(userId)});
            if(dev) console.warn(`[DB][SELECT] SELECT failed - ${error}`)
            return [];
        }
    }

    /**
     * Delete Function
     * @param options table, id, filter
     * @param userId (optional) ID of performing user
     * @returns Array of affected rows, even if empty
     */
    static async delete(options: {table: string, id?: string, filter?: Record<string, any>; delAllIntention?: Boolean }, userId?: string): Promise<any[]> {
        const {
            table,
            id,
            filter = {},
            delAllIntention = false,
        } = options;

        const db = await SurrealDB.getDB();
        if (!db) throw new Error("SurrealDB not connected");

        let query: string | undefined;

        try {

            // Delete by id
            if (id) {
                let recordId: RecordId<any>;

                if (typeof id === "string") {
                    // Split if id has a table prefix
                    if (id.includes(":")) {
                        const [prefix, bareId] = id.split(":");
                        recordId = new RecordId(prefix, bareId);
                    } else {
                        recordId = new RecordId(table, id);
                    }
                } else if (id instanceof RecordId) {
                    recordId = id; // already a RecordId
                } else {
                    throw new Error(`Invalid id type for deletion: ${id}`);
                }

                const result = await db.delete(recordId);
                return Array.isArray(result) ? result : [result];
            }
            
            // Delete by filter
            const filterKeys = Object.keys(filter);
            if(filterKeys.length > 0) {
                const filterParts = filterKeys.map(key => {
                    const value = filter[key];
                    return typeof value === "string" ? `${key} = "${value}"` : `${key} = ${value}`;
                });

                query = `DELETE FROM ${table} WHERE ${filterParts.join(" AND ")}`;

                const result = await db.query(query);
                const data = Array.isArray(result) ? result[0] : result;
                return Array.isArray(data) ? data : [data];
            }

            // Delete all rows in table
            if(delAllIntention) {
                const result = await db.delete(table);
                return Array.isArray(result) ? result : [result];
            }

            return [];

        } catch (error) {
            Logger.warn("[DB][DELETE]", "DELETE failed", String(error), { table, id, filter }, {id: userId});
            if (dev) console.warn(`[DB][DELETE] DELETE failed - ${error}`);
            return [];
        }
    }

    /**
     * Update Function
     * @param dbObj Object containing id and fields to update
     * @param userId (optional) ID of performing user 
     * @returns Array of affected rows, even if empty
     */
    static async update(dbObj: Record<string, any>, userId?: string): Promise<any> {
        if (!dbObj.id) throw new Error("Object id is required");

        const db = await SurrealDB.getDB();
        if (!db) throw new Error("SurrealDB not connected");

        const { id, ...data } = dbObj;
        const query = `UPDATE type::thing($id) CONTENT $data`;

        try {
            const result = await db.query(query, { id, data });
            const updatedObj = Array.isArray(result) ? result[0] : result;

            return updatedObj || [];

        } catch(error) {
            Logger.warn("[DB][UPDATE]", `Failed to update object ${id}`, String(error), { id, data }, {id: userId});
            if (dev) console.warn(`[DB][UPDATE] Failed to update object ${id} - ${error}`);
            return [];
        }
    }

    /**
     * Query Function
     * @param query Raw SurrealDB query string
     * @param userId (optional) ID of performing user
     * @returns Array of affected rows, even if empty
     */
    static async query(query: string, userId?: string): Promise<any[]> {
        const db = await SurrealDB.getDB();
        if (!db) throw new Error("SurrealDB not connected");

        try {
            const result = await db.query(query);
            return Array.isArray(result) ? result[0] : [result];

        } catch (error) {
            Logger.warn("[DB][QUERY]", "Query execution failed", String(error), { query }, {id: userId});
            if (dev) console.warn(`[DB][QUERY] Failed - ${error}`);
            return [];
        }
    }
}