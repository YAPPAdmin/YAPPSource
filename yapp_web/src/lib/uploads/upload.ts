
import { writable } from "svelte/store";
import ExifReader from "exifreader";

export type FileWrapper = {
    name: string,
    description: string,
    source: string,
    id?: string,
    file?: File|Buffer,
    size?: number,    
    online?: string,
    blobURL?: string,
    ext?: string,
    uploadTime?: Date,
    metadata?: {
        width?: number,
        height?: number,
        camera?: string,
        iso?: string,
        dateTaken?: string,
    }
}

type UploadModalData = {
    hasName?: boolean, 
    hasDescription?: boolean, 
    hasSource?: boolean
}

type ProgressState = {
    isUploading: boolean;
    percentage: number;
    fileName: string;
    fileSize: number;
    thumbnail: string;
    currentCount: number;
    totalCount: number;
}

export const initialProgress: ProgressState = {
    isUploading: false,
    percentage: 0,
    fileName: "",
    fileSize: 0,
    thumbnail: "",
    currentCount: 0,
    totalCount: 0
};

export const uploadProgress = writable<ProgressState>(initialProgress);


export const fileUpload = writable<any | null>(null);

function createFileUploadStore() {
    const { subscribe, update } = writable<any[]>([]);

    return { 
        subscribe,

        open(content: UploadModalData) {
            update(stack => [...stack, content]);
        },

        close() {
            update(stack => stack.slice(0, -1));
        },

        clear() {
            update(() => []);
        },
    };
};

export const fileUploadStack = createFileUploadStore();

export async function loadExifData(file: File, wrapper: FileWrapper) {
    try {
        const tags = await ExifReader.load(file)

        const make = tags["Make"]?.description; 
        const model = tags["Model"]?.description;
        const cameraName = [make, model].filter(Boolean).join(" ");
        wrapper.camera = cameraName || undefined;

        const iso = tags["ISOSpeedRatings"]?.description;

        wrapper.iso = iso ? iso : "";
        wrapper.dateTaken = tags["DateTimeOriginal"]?.description;
    
        return wrapper;
    } catch(error) {
        console.warn("No EXIF data found on file");
        return wrapper;
    }
}