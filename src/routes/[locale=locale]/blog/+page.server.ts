import { getPage } from '$lib/server/api/posts';
import { tags } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const prerender = false;

export function load({ url, params }) {
	const page = Number(url.searchParams.get('page')) || 1;
	const result = getPage(params.locale, page);
	return { ...result, locale: params.locale, tags };
}
