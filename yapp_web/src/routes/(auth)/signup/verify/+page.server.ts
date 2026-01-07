import { redirect } from '@sveltejs/kit';
import { validateEmail } from '$lib/utils/auth/User';

export const load = async ({ url }) => {
    const email = url.searchParams.get('email');

    // Redirect on empty/invalid email
    if (!email || !validateEmail(email)) {
        console.log('NO EMAIL or invalid email');
        throw redirect(302, '/signup');
    }

    return {
        email
     };
};