import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async (event) => {
	if(!event.locals.user) redirect(302, "/login");
	if(!event.locals.user.admin) redirect(302, "/")
	return {
		username: event.locals.user.username
	};
};