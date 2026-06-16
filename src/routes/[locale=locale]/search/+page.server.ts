import { search } from '$lib/server/api/posts';
import { tags } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const prerender = false;

export function load({ url, params }) {
	const q = url.searchParams.get('q') || undefined;
	const tag = url.searchParams.get('tag') || undefined;
	const sort = (url.searchParams.get('sort') || 'date') as 'date' | 'date_asc';

	const result = search({ q, tag, sort, limit: 20 });
	return { ...result, query: q || '', activeTag: tag || '', sort, locale: params.locale, tags };
}
