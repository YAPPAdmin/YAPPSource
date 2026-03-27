// src/routes/(app)/[...catchall]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
    console.log("CATCHALL")
    throw error(404, 'Page not found');
};