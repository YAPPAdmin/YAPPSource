import { error } from '@sveltejs/kit';
import { PageService } from '$lib/utils/pageEditor/PageServiceSS'; 
import { PageLayout } from '$lib/utils/pageEditor/PageLayout';     
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const pageLayout = await PageService.getPageForSlug();

    if (!pageLayout || !pageLayout.isPublic) {
        throw error(404, 'Page not found');
    }

    const mainVersion = pageLayout.versions.find(version => version.isMainVersion == true);

    if(!mainVersion) {
        throw error(404, "Page not found")
    }

    console.log("MAIN VERSION: ", mainVersion)

    return {
        version: JSON.parse(JSON.stringify(mainVersion))
    };
};