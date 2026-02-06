import { writable } from "svelte/store";
import type { SvelteComponent } from "svelte";

type PopupVariant = "modal" | "toast";

type PopupContent = 
    | { type: "text"; title?: string; message: string; buttons?: {label: string; action: () => void }[], variant?: PopupVariant, closeText?: string } // Text Based Popup
    | { type: "component"; component: typeof SvelteComponent; props?: Record<string, any>, variant?: PopupVariant, closeText?: string } // Component Based Popup
    | { type: "image"; imageUrl: string; imageName?: string; imageAuthor?: string, variant?: PopupVariant} // Pure Image Based Popup

export const popup = writable<PopupContent | null>(null);

function createPopupStore() {
    const { subscribe, update } = writable<PopupContent[]>([]);

    return {
        subscribe,
        
        open(content: PopupContent) {
            update(stack => [...stack, content]); // Add to Popup Stack
        },

        close() {
            update(stack => stack.slice(0, -1)); // Remove last Popup
        },

        clear() {
            update(() => []) // Remove all Popups
        },
    }
}

export const popupStack = createPopupStore();

// Example
// popupStack.open({
//     type: "text",
//     title: "Successfully created new BlogPost",
//     message: "A new Blog Post has been created",
//     buttons: [{ 
//         label: "Take me there", 
//         action: () => {
//             goto(`/blog/${data.blogPost.id}`)
//         }, 
//     }],
// });