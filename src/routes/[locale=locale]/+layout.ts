import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = true;

export function load({ params }) {
	return {
		locale: params.locale as 'en' | 'de'
	};
}
