
import { writable } from "svelte/store";


type UploadModalData = {
    hasName?: boolean, 
    hasDescription?: boolean, 
    hasSource?: boolean
}

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


