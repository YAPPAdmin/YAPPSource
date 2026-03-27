import { dev } from "$app/environment";
import { loadExifData, type FileWrapper } from "$lib/uploads/upload";
import { UserService } from "$lib/utils/auth/UserService";
import { Logger } from "$lib/utils/logger";
import { Uploads } from "$lib/utils/uploads";
import type { RequestHandler } from "@sveltejs/kit";
import { v4 as uuidv4 } from 'uuid';
import sharp from "sharp";
import exifReader from "exif-reader";
import path from "path";
import { Readable } from "stream";

export const GET: RequestHandler = async (event) => {
    try {
        const getType = event.url.searchParams.get("getType") || "getReg";
        const fileId = event.url.searchParams.get("fileId") || "";
        const fileName = event.url.searchParams.get("fileName") || "";
        const fileSource = event.url.searchParams.get("fileSource") || "";
        const widthParam = event.url.searchParams.get("width") || ""

        let result: any;

        if(getType == "getReg") {
            result = await Uploads.getFileFromRegistry(fileId, fileName, fileSource);

            if(!result.length) {
                return new Response(JSON.stringify({ error: "No image found"}), { status: 404 })
            }

            return new Response(JSON.stringify({ result: result }), { status: 200 });

        } else if(getType == "getImg") {
            result = await Uploads.getFileFromStorage(fileId);

            if(!result.success || !result.stream) {
                return new Response(JSON.stringify({ error: "Image not found" }), { status: 404 })
            }

            let resizedStream = result.stream;
            let resizedStreamType = result.contentType;

            if(widthParam) {
                const width = parseInt(widthParam)

                if(!isNaN(width)) {

                    let inputStream = result.stream;

                    if (typeof inputStream.pipe !== 'function') {
                        inputStream = Readable.fromWeb(inputStream);
                    }

                    const transformer = sharp()
                        .resize({ width: width, withoutEnlargement: true })
                        .jpeg({ quality: 90, mozjpeg: true })
                
                    resizedStream = inputStream.pipe(transformer);
                    resizedStreamType = "image/jpeg"
                }
            }

            return new Response(resizedStream, {
                headers: {
                    "Content-Type": resizedStreamType,
                    "Cache-Control": "public, max-age=86400" 
                }
            })

        } else {
            return new Response(JSON.stringify({ error: "Invalid Search Param"}), { status: 400 })
        }

    } catch(error) {
        if(dev) console.error("Error getting file", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

export const POST: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {
        const form = await event.request.formData();
        const file = form.get("file") as File | undefined;
        const name = form.get("name") as string | undefined;
        const description = form.get("description") as string | "";
        const source = form.get("source") as string | "";
        const online = form.get("online") as string | "";
        
        if(!name) return new Response(JSON.stringify({error: "No name found"}), { status: 400 })

        let wrapper: FileWrapper = {
            id: uuidv4().replace(/-/g, ""),
            name: name,
            description: description,
            source: source,
            file: file,
            online: online,
            uploadTime: new Date(),
            size: file?.size || 0,
            metadata: {
                width :0,
                height :0,
                camera :"",
                iso :"",
                dateTaken :"",
            },
        }

        console.log("UPLOAD SIZE: ", file?.size)

        let buffer: Buffer;
        let extension: string = "";

        if(online && online != "false") {
            const response = await fetch(online);
            if(!response.ok) throw new Error("Could not fetch remote image");
        
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);

            const contentType = response.headers.get("content-type");
            extension = contentType?.split("/")[1] || "jpg";
        } 

        else if(file && file.size > 0) {
            buffer = Buffer.from(await file.arrayBuffer());
            extension = file.name.split(".").pop() || "jpg";
        } 

        else {
            return new Response(JSON.stringify({ error: "No image source found" }), { status: 400 });
        }

        wrapper.ext = extension;
        const image = sharp(buffer);
        const metadata = await image.metadata();

        wrapper.metadata!.width = metadata?.width || 0;
        wrapper.metadata!.height = metadata?.height || 0;

        if(metadata.exif) {
            try {
                const parsedExif = exifReader(metadata.exif);
                const make = parsedExif.Image?.Make || "";
                const model = parsedExif.Image?.Model || "";
                
                wrapper.metadata!.camera = `${make} ${model}`.trim() || "";
                wrapper.metadata!.iso = parsedExif.Photo?.ISO ? String(parsedExif.Photo.ISO) : "";
                wrapper.metadata!.dateTaken = parsedExif.Photo?.DateTimeOriginal ? parsedExif.Photo.DateTimeOriginal.toISOString() : "";
            } catch (error) {
                console.warn("Could not parse EXIF buffer:", error);
            }
        }

        const result = await Uploads.saveFile(wrapper, dbUser.getId())
        return new Response(JSON.stringify(result), { status: 201 })

    } catch(error) {
        if(dev) console.error("Error uploading file", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

export const PUT: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {
        const id = event.url.searchParams.get("id");
        const name = event.url.searchParams.get("name") || undefined;
        const description = event.url.searchParams.get("description") || undefined;
        const source = event.url.searchParams.get("source") || undefined;

        if (!id) {
            return new Response(JSON.stringify({ error: "Missing file id" }), { status: 400 });
        }

        if(!name && !description && !source) {
            return new Response(JSON.stringify({ error: "No changes" }), { status: 400 });
        }

        const result = await Uploads.updateFile(id, dbUser.getId(), name, description, source);

        console.log("RESULT: ", result)

        if (!result || !result.success) {
            return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 });
        }

        return new Response(JSON.stringify({ updated: result.changes }), { status: 200 });


    } catch(error) {
        if(dev) console.error("Error updating file", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

export const DELETE: RequestHandler = async (event) => {
    // Get Session
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email)

    if (!session?.user || !dbUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try{
        const fileId = event.url.searchParams.get("fileId");

        if (!fileId) {
            return new Response(JSON.stringify({ error: "No image found" }), { status: 404 });
        }

        const result = await Uploads.deleteFile(fileId);

        if(!result.success) {
            Logger.info("[API][DELETE FILE]", "Deleted File", { fileId: fileId }, { id: dbUser.getId()} )
            return new Response(JSON.stringify({ error: result.error || "Delete failed"}), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "File deleted successfully" }), { status: 200 });

    } catch(error) {
        if(dev) console.error("Error deleting file", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}