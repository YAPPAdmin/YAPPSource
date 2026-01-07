import { SurrealDB } from "$lib/database/newSurrealDB";
import { dev } from "$app/environment";
import { Logger } from "$lib/utils/logger";
import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from 'uuid';
import { UserService } from "./auth/UserService";
import { table } from "node:console";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from '$env/dynamic/private';

let _s3Client: S3Client;

function getS3Client() {
    if (!_s3Client) {
        // This log will help you verify the variables are finally loaded
        if (dev) console.log("Initializing S3 for bucket:", env.AWS_S3_BUCKET_NAME);
        
        console.log("REGION: ", env.AWS_REGION)

        _s3Client = new S3Client({
            region: env.AWS_REGION || "ap-southeast-2", // Fallback just in case
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    return _s3Client;
}

export class Uploads {

    // #region SAVE
    static async saveFileUpload(file: File, userId: string, name: string, description: string, source: string) {
        const timestamp = Date.now();
        const fileId = uuidv4().replace(/-/g, "");
        let localResult;

        const storageResult = await Uploads.saveFileToBucket(file, fileId, userId);

        const registryResult = await Uploads.saveFileToRegistry(timestamp, fileId, userId, name, description, source, storageResult.url);

        if(dev) localResult = await Uploads.saveFileToStorage(timestamp, file, fileId, userId);

        return { storageResult, registryResult, localResult };
    }

    private static async saveFileToStorage(timestamp: number, file: File, fileId: string, userId: string) {

        try{        
            const uploadDir = path.join(process.cwd(), "static", "uploads");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Extract safe filename based on uploaded file
            const originalFilename = file.name;
            const ext = path.extname(originalFilename) || "";
            const filename = `${fileId}${ext}`;
            const filePath = path.join(uploadDir, filename);

            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filePath, buffer);

            if (dev) console.log("FILE STORED:", filename);

            return {
                success: true,
                fileId,
                filename,
                url: `/uploads/${filename}`
            };
        } catch(error) {
            Logger.warn("[FILE][STORAGE]", "Writing File to Storage failed", String(error), { fileId, filename: file.name }, { id: userId });
        }
    }

    private static async saveFileToRegistry(timestamp: number, fileId: string, userId: string, name: string, description: string, source: string, fileUrl: string) {
        try {
            const result = await SurrealDB.create({
                table: "images",
                data: {
                    id: fileId,
                    name,
                    description,
                    source,
                    fileUrl,
                    userId,
                    created_at: new Date(timestamp).toISOString(),
                }
            });

            if (dev) console.log("REGISTRY UPDATED:", result);

            return {
                success: true,
                id: result[0].id
            };
        } catch (error) {
            Logger.warn("[FILE][REGISTRY]", "Writing File to Registry failed", String(error), { fileId, filename: name }, { id: userId });

            return {
                success: false,
            };
        }
    }

    private static async saveFileToBucket(file: File, fileId: string, userId: string) {
        try {
            const ext = path.extname(file.name) || "";
            const filename = `${fileId}${ext}`;
            const key = `/uploads/${filename}`;

            // Convert file to Buffer
            const buffer = Buffer.from(await file.arrayBuffer());
            const client = getS3Client();

            const command = new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: file.type
            })

            await client.send(command);

            const url = `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

            if(dev) console.log(`S3 UPLOAD ${filename} Successfull\nURL: ${url}\nKey: ${key}`);

            return {
                    success: true,
                    url: url
                };

        } catch(error) {
            Logger.warn("[FILE][S3_STORAGE]", "Uploads to AWS failed", String(error), { fileId }, { id: userId });
        }
    }
    // #endregion

    // #region GET
    static async getFile(fileId?: string, fileName?: string, source?: string): Promise<any[]> {
        const registryResult = await Uploads.getFileFromReg(fileId, fileName, source);
        
        if (registryResult.length === 0) return [];
        
        const fileResult = await Uploads.getFileFromStorage(registryResult);
        
        return fileResult;
    }

    private static async getFileFromReg(fileId?: string, fileName?: string, source?: string): Promise<any[]> {

        let result: any[] = [];

        if(fileId) {
            result = await SurrealDB.select({table: "images", id: fileId});

        } else if(fileName) {
            result = await SurrealDB.select({table: "images", filter: { fileName }});

        } else if(source) {
            result = await SurrealDB.select({table: "images", search: { source }});
        } else {
            result = await SurrealDB.select({table: "images"})
        }

        return result;

    }

    private static async getFileFromStorage(registry: any[]) {

        let files: any[] = [];

        for(const entry of registry) {
        const { fileUrl } = entry;

        const fileName = fileUrl.replace(/^\//, '');
        const filePath = path.join(process.cwd(), "static", fileName);

            try {
                const buffer = fs.readFileSync(filePath);
            
                files.push({
                    metadata: entry,
                    buffer: buffer,
                })
            
            } catch(error) {
                if(dev) console.error(`Failed to read file ${fileName}: ${error}`);
                files.push({
                    metadata: entry,
                    error: "File not found",
                })
            }
        }   
        return files;
    }
    // #endregion

    // #region DELETE
    static async deleteFile(fileId: string) {
        if (!fileId.startsWith("images:")) fileId = `images:${fileId}`;
        
        const entry = await Uploads.getFileFromReg(fileId);

        if(!entry || entry.length == 0) {
            return [];
        }

        const fileURL = entry[0].fileUrl;

        const storageResult = await Uploads.deleteFileFromStorage(fileURL);
        const registryResult = await Uploads.deleteFileFromRegistry(fileId);

        if(storageResult && registryResult) return fileId;
    }

    private static async deleteFileFromRegistry(fileId: string) {
        try {
            await SurrealDB.delete({table: "images", id: fileId});
            return true;
        } catch(error) {
            if(dev) console.error("Error deleting file from Registry", error);
            Logger.warn("[FILE][DELET]", "Error deleting file from Registry", String(error), {fileId: fileId})
        }
    }

    private static async deleteFileFromStorage(fileURL: string) {
        console.log("deleteFileFromStorage: ", fileURL)

        try {            
            const fileName = fileURL.replace(/^\//, ""); 
            const filePath = path.join(process.cwd(), "static", fileName);

            if(fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            } else {
                if(dev) console.error("File not existing on disc", fileURL);
                return;
            }

            return true;
        } catch(error) {
            if(dev) console.error("Error deleting file from Storage", error);
            Logger.warn("[FILE][DELET]", "Error deleting file from Storage", String(error), {fileId: fileId})
        }
    }

    // #endregion

    // #region UPDATE
    static async updateFile(fileId: string, updates: {name?: string, }) {
        if (!fileId.startsWith("images:")) fileId = `images:${fileId}`;

        try {

            const data: Record<string, any> = {};

            for(const [key, value] of Object.entries(updates)) {
                if(value != undefined && value != null) {
                    data[key] = value;
                }
            }

            if(Object.keys(data).length == 0) {
                return [];
            }

            const result = await SurrealDB.update({
                table: "images",
                id: fileId,
                ...data
            })

            return result;

        }catch (error) {
            if (dev) console.error("Error updating file in Registry", error);
            Logger.warn("[FILE][UPDATE]", "Error updating file in Registry", String(error), { fileId });
            return { success: false };
        }
    }

    // #endregion
}



