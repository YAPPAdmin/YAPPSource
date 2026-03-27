import { writable } from "svelte/store";


export const newPageStore = writable<any | null>(null);

function createNewPageStore() {
    const { subscribe, update } = writable<any[]>([]);

    return {
        subscribe, 

        open(content: any) {
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

export const newPageStack = createNewPageStore();