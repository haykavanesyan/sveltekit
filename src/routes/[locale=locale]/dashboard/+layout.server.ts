import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const prerender = false;

export const load: LayoutServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, `/${params.locale}/login?redirect=/${params.locale}/dashboard`);
	}
	return { user: locals.user };
};
