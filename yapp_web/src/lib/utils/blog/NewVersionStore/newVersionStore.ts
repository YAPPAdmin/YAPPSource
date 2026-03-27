import { writable } from "svelte/store";
import type { BlogPost } from "../blog";

type NewVersionModalData = {
    blogPost?: BlogPost;
    baseVersionId?: string;
}

export const newVersionStore = writable<any | null>(null);

function createNewVersionStore() {
    const { subscribe, update } = writable<NewVersionModalData[]>([])

    return {
        subscribe,

        open(content: NewVersionModalData) {
            update(stack => [...stack, content])
        },

        close() {
            update(stack => stack.slice(0, -1));
        },

        clear() {
            update(() => [])
        },
    }
}

export const newVersionStack = createNewVersionStore();
