import { destroySession } from '$lib/server/api/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ cookies, params }) => {
	const token = cookies.get('session');
	if (token) {
		destroySession(token);
	}
	cookies.delete('session', { path: '/' });
	throw redirect(303, `/${params.locale}/login`);
};

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies, params }) => {
		const token = cookies.get('session');
		if (token) {
			destroySession(token);
		}
		cookies.delete('session', { path: '/' });
		throw redirect(303, `/${params.locale}/login`);
	}
};
