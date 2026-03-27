import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export function persistedStore<T>(key: string, initialValue: T) {
    const storedValue = browser ? window.localStorage.getItem(key) : null;

    const initial = storedValue ? JSON.parse(storedValue) : initialValue;

    const store = writable<T>(initial);

    store.subscribe(value => {
        if (browser) {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    });

    return store;
}