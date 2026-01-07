import { writable } from "svelte/store";
import { defaultLayout } from "./customRendere";

const STORAGE_KEY = 'yapp-layout';


function createLayoutStore() {
    if (typeof window === 'undefined') {
        const { subscribe, set, update } = writable(defaultLayout);
        return { subscribe, set, update };
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = stored ? JSON.parse(stored) : defaultLayout;
    const { subscribe, set, update } = writable(initial);
    subscribe((value) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return { subscribe, set, update };
}

export const layoutStore = createLayoutStore();