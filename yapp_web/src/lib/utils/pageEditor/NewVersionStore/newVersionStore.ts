import { writable } from "svelte/store";

export const newVersionStore = writable<any | null>(null);

function createNewVersionStore() {
    const { subscribe, update } = writable<any[]>([])

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

export const newVersionStack = createNewVersionStore();
