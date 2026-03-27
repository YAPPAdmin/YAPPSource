import { writable } from "svelte/store";

type NewBlogModalData = {

}

export const newBlogStore = writable<any | null>(null);

function createNewBlogStore() {
    const { subscribe, update } = writable<any[]>([])

    return {
        subscribe,

        open(content: NewBlogModalData) {
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

export const newBlogStack = createNewBlogStore();

