import { redirect } from '@sveltejs/kit';

export function load({ request }) {
	const accept = request.headers.get('accept-language') || 'en';
	const preferred = accept.split(',')[0]?.split('-')[0] || 'en';
	const locale = (preferred === 'de' ? 'de' : 'en') as string;
	throw redirect(307, `/${locale}`);
}
