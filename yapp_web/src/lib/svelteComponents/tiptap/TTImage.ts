import { getAttributes } from "@tiptap/core"
import ImageResize from 'tiptap-extension-resize-image';

export const CustomImage = ImageResize.extend({
    addAttributes() {
        return {
            ...this.parent?.(),

            // Cutsom image class
            class: {
                default: null,
                renderHTML: () => {
                    return {
                        class: "max-w-full h-auto mx-auto block bg-gray-500 cursor-pointer rounded-lg"
                    }
                }
            },
            
            // Lazy loading
            loading: {
                default: 'lazy',
                renderHTML: () => {
                    return { loading: 'lazy' }
                }
            },

            // Custom file id
            fileId: {
                default: null,
                parseHTML: element => element.getAttribute("data-file-id"),
                renderHTML: getAttributes => {
                    if(!getAttributes.fileId) return {}
                    return { "data-file-id": getAttributes.fileId}
                }
            },

            height: {
                default: null,
                parseHTML: element => element.getAttribute("height"),
                renderHTML: getAttributes => {
                    if(!getAttributes.height) return {}
                    return { height: getAttributes.height}
                }
            }
        }
    }
})