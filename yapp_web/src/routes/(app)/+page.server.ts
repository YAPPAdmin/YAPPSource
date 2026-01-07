import { LayoutService } from "$lib/customRenderer/layoutUtilsSS";
import type { LayoutServerLoad } from "../$types";


export const load: LayoutServerLoad = async () => {

    const layout = await LayoutService.renderLayout();

    if (!layout) {
        return {
            layout: []
        };
    }

    return {
        layout: layout.blocks ?? []
    };
};