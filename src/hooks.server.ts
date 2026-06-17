import { getSession } from '$lib/server/api/auth';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const LOCALES = ['en', 'de'] as const;

export const handle: Handle = async ({ event, resolve }) => {
	const { url, cookies } = event;

	if (url.pathname === '/') {
		const accept = event.request.headers.get('accept-language') || 'en';
		const preferred = accept.split(',')[0]?.split('-')[0] || 'en';
		const locale = LOCALES.includes(preferred as 'en') ? preferred : 'en';
		throw redirect(307, `/${locale}`);
	}

	const sessionToken = cookies.get('session');
	if (sessionToken) {
		const session = getSession(sessionToken);
		if (session) {
			const { users } = await import('$lib/server/database');
			const user = users.find((u) => u.id === session.userId);
			if (user) {
				event.locals.user = { id: user.id, name: user.name, email: user.email, role: user.role };
			}
		}
	}

	const result = await resolve(event);
	return result;
};
