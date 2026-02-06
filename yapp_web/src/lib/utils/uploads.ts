import { SurrealDB } from "$lib/database/newSurrealDB";
import { dev } from "$app/environment";
import { Logger } from "$lib/utils/logger";
import { env } from '$env/dynamic/private';
import Client from 'ssh2-sftp-client';
import type { FileWrapper } from "$lib/uploads/upload";
import sharp from "sharp";
import exifReader from "exif-reader";
// import sftp from "ssh2-sftp-client";


export class Uploads {

    // #region SAVE
    static async saveFile(file: FileWrapper, userId: string): Promise<{registryResult: boolean, storageResult?: boolean}> {

        if(file.online) {
            const registryResult = await Uploads.saveFileToRegistry(file, userId)    
            return {registryResult};
        
        } else {
            const storageResult = await Uploads.saveFileToStorage(file, userId);

            if(!storageResult) return {registryResult: false, storageResult: false}

            const registryResult = await Uploads.saveFileToRegistry(file, userId);

            return {registryResult, storageResult}
        }
    }

    private static async saveFileToRegistry(file: FileWrapper, userId: string): Promise<boolean> {
        try {
            const { file: _, blobURL: __, ...dbData } = file;

            const result = await SurrealDB.create({
                table: "images",
                data: {
                    ...dbData,
                    name: file.name || file.id,
                }
            });

            if(!result.length) return false;
            return true;

        } catch (error) {
            Logger.warn("[FILE][REGISTRY]", "Writing File to Registry failed", String(error), { id: file.id, name: file.name }, { id: userId });
            return false;
        }
    }

    private static async saveFileToStorage(file: FileWrapper, userId: string): Promise<boolean> {
        
        if(!file || !file.file) return false;

        // Clean File
        const buffer = Buffer.from(await file.file.arrayBuffer());
        const image = sharp(buffer)
        const metadata = await image.metadata();
        file.metadata = {};
        file.metadata.width = metadata?.width || 0;
        file.metadata.height = metadata?.height || 0;

        if(metadata.exif) {
            try {
                const parsedExif = exifReader(metadata.exif);
                const make = parsedExif.Image?.Make || "";
                const model = parsedExif.Image?.Model || "";
                
                file.metadata.camera = `${make} ${model}`.trim() || "";
                file.metadata.iso = parsedExif.Photo?.ISO ? String(parsedExif.Photo.ISO) : "";
                file.metadata.dateTaken = parsedExif.Photo?.DateTimeOriginal ? parsedExif.Photo.DateTimeOriginal.toISOString() : "";
            } catch (error) {
                console.warn("Could not parse EXIF buffer:", error);
            }
        }

        // Sanitized Buffer
        const cleanBuffer = await image.rotate().toBuffer();
        file.size = cleanBuffer.length;

        let sftp = new Client();

        try {
            const uploadDir = 'uploads';
            const ext = file.ext;
            const filename = `${file.id}.${ext}`;
            const remotePath = `${uploadDir}/${filename}`;

            // Connect
            await sftp.connect({
                host: env.HETZ_HOST,
                username: env.HETZ_USER,
                password: env.HETZ_PASS,
                port: env.HETZ_PORT,
            })

            // Ensure folder exits
            const exists = await sftp.exists(uploadDir);
            if (!exists) {
                if (dev) console.log(`Creating directory: ${uploadDir}`);
                await sftp.mkdir(uploadDir, true);
            }

            // Upload
            const result = await sftp.put(cleanBuffer, remotePath);

            // Verification
            const fileStats = await sftp.stat(remotePath);

            // Check if file exists and size matches
            if (!fileStats || fileStats.size != cleanBuffer.length) {
                throw new Error(`Upload verification failed. Server size: ${fileStats.size}, Local size: ${cleanBuffer.length}`);
            } 

            return true;

        } catch(error) {
            Logger.warn("[FILE][HETZ_STORAGE]", "Uploads to HETZNER failed", String(error), { id: file.id }, { id: userId });
            return false;
        }finally {
            await sftp.end(); 
        }
    }
    // #endregion


    // #region GET
    static async getFileFromRegistry(fileId?: string, fileName?: string, source?: string): Promise<FileWrapper[]> {
        let result: any[] = [];

        if(fileId) {
            const formatedId = fileId.startsWith("images:",) ? fileId : `images:${fileId}`
            result = await SurrealDB.select({table: "images", id: formatedId});
        } else if(fileName) {
            result = await SurrealDB.select({table: "images", filter: { fileName }});
        } else if(source) {
            result = await SurrealDB.select({table: "images", search: { source }});
        } else {
            result = await SurrealDB.select({table: "images"})
        }

        const fileWrappers: FileWrapper[] = result.map((entry) => {
            const idString = typeof entry.id == "object" ? entry.id.id : entry.id;


            const newWrapper: FileWrapper = {
                id: idString,
                name: entry.name || idString,
                description: entry.description || "",
                source: entry.source || "",
                online: entry.online || "",
                blobURL: entry.url,
                ext: entry.ext,
                uploadTime: entry.uploadTime,
                size: entry.size || undefined,
                metadata: entry.metadata,
            }
            return newWrapper;
            }
        )

        fileWrappers.sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, {
                numeric: true,      // "Image 2" comes before "Image 10"
                sensitivity: 'base' // Ignore case (A vs a)
            });
        });

        return fileWrappers;
    }

    static async getFileFromStorage(fileId: string) {
        // Get file from DB
        const regRestult = await Uploads.getFileFromRegistry(fileId)

        if(!regRestult.length) return { success: false };

        const ext = regRestult[0].ext;
        if(!ext) return { success: false }

        const cloudURL = `https://${env.HETZ_HOST}/uploads/${fileId}.${ext}`;
        const auth = Buffer.from(`${env.HETZ_USER}:${env.HETZ_PASS}`).toString("base64");

        const result = await fetch(cloudURL, {
            headers: {"Authorization": `Basic ${auth}`}
        });

        if(!result.ok) return { success: false };

        return { 
            success: true, 
            stream: result.body, 
            contentType: result.headers.get("Content-Type") || "image/jpeg"};

    }
    // #endregion


    // #region DELETE
    static async deleteFile(fileId: string, forced: boolean = false) {
        let dbResult = await this.getFileFromRegistry(fileId)
        const registryEntry = dbResult[0]
        
        let registryResult;

        if(!registryEntry.online) {
            let storageResult = await this.deleteFileFromStorage(fileId);

            if(!storageResult.success && !forced) {
                return { success: false, error: storageResult.error || "Storage Delete failed"};
            }
        }

        registryResult = await this.deleteFileFromRegistry(fileId);

        if(!registryResult.success) {
            return { success: false, error: registryResult.error || "Registry Delete failed"};
        }

        return { success: true }
    }

    static async deleteFileFromRegistry(fileId: string) {
        try {
            let result = await SurrealDB.delete({table: "images", id: fileId});
            return {success: true};
        
        }catch(error) {
            console.log("Registry Delete failed: ", error)
            return {success: false, error: error}
        }
    }

    static async deleteFileFromStorage(fileId: string) {
        try {

        // Get file from DB
        const regRestult = await Uploads.getFileFromRegistry(fileId);

        if(!regRestult || regRestult.length == 0) return { success: false };

        const ext = regRestult[0].ext;
        if(!ext) return { success: false }

        const cloudURL = `https://${env.HETZ_HOST}/uploads/${fileId}.${ext}`;
        const auth = Buffer.from(`${env.HETZ_USER}:${env.HETZ_PASS}`).toString("base64");

        const result = await fetch(cloudURL, {
            method: "DELETE",
            headers: { "Authorization": `Basic ${auth}`}
        })

        if (!result.ok && result.status !== 204) {
            console.error("Failed to delete from Cloud Storage");
            return { success: false, error: "Storage deletion failed" };
        }

        return { success: true }
        
        } catch(error) {
            console.log("Storage Delete failed", error)
            return { success: false, error: "Storage deletion failed" }
        }
    };


    // #endregion


    // #region UPDATE
    static async updateFile(fileId: string, userId: string, name?: string, description?: string, source?: string) {
        try {
            if(!fileId || (!name && !description && !source)) return;

            const dbResult = await Uploads.getFileFromRegistry(fileId)
            const regRestult = dbResult[0]

            if(!regRestult.id) {
                throw new Error("No Entry to update")
            }

            const updateObj = {
                id: `images:${fileId}`,
                name: name || "",
                description: description || "",
                source: source || "",
            }

            const result = await SurrealDB.update(updateObj, userId)

            if(!result[0].id) return { success: false, changes: false}

            const changes = (result[0].name != name || result[0].description != description || result[0].source != source)

            return {
                success: true,
                changes: changes,
            };

        }catch (error) {
            Logger.warn("[FILE][REGISTRY]", "Updating File failed", String(error), { id: fileId, name: name }, { id: userId });
            return { success: false, changes: false };
        }
    }
    // #endregion
}



