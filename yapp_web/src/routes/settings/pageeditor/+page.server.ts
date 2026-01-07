import { LayoutService } from '$lib/customRenderer/layoutUtilsSS.js';
import { UserService } from '$lib/utils/auth/UserService.js';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
    const session = await event.locals.auth(event);
    const dbUser = await UserService.readUser("email", session?.user?.email);

    if (!session?.user || !dbUser) {
        throw redirect(303, '/login');
    }

    const layoutRegistry = await LayoutService.getLayoutRegistry();
    const layoutId = layoutRegistry.length > 0 ? layoutRegistry[0].id : null;

    let loadedLayout = null;
    if (layoutId) {
        const recordId = layoutId.includes(':') ? layoutId : `layout:${layoutId}`;
        const layout = await LayoutService.getLayout(recordId);
        if (layout) {
            loadedLayout = layout.toJSON();
        }
    }

    return {
        layoutRegistry,
        loadedLayout 
    };
};
