import type { LayoutLoad } from './$types';

export const ssr = true;

export function load({ params, data }) {
	return {
		locale: params.locale as 'en' | 'de',
		user: data.user
	};
}
