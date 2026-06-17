import type { LayoutLoad } from './$types';

export const ssr = true;

export const load: LayoutLoad = ({ params, data }) => {
	return {
		locale: params.locale as 'en' | 'de',
		user: data.user
	};
}
