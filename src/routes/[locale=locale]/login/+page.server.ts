import { LoginSchema } from '$lib/schemas/auth';
import { verifyCredentials, createSession } from '$lib/server/api/auth';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;
export const config = { runtime: 'nodejs20.x' };

export const load: PageServerLoad = async ({ locals, params }) => {
	if (locals.user) {
		throw redirect(303, `/${params.locale}/dashboard`);
	}
	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies, params }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = LoginSchema.safeParse(formData);

		if (!parsed.success) {
			const errors = parsed.error.flatten().fieldErrors;
			return fail(422, {
				error: errors.email?.[0] || errors.password?.[0] || 'Invalid input',
				fields: { email: formData.email as string }
			});
		}

		const user = verifyCredentials(parsed.data.email, parsed.data.password);
		if (!user) {
			return fail(401, { error: 'login.error', fields: { email: parsed.data.email } });
		}

		const token = createSession(user.id);
		cookies.set('session', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24
		});

		const redirectTo = (formData.redirect as string) || `/${params.locale}/dashboard`;
		throw redirect(303, redirectTo);
	}
};
