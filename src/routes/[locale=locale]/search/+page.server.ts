import { searchPage } from '$lib/server/api/posts';
import { tags } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const config = { runtime: 'edge' };

export const prerender = false;

export const load: PageServerLoad = ({ url, params }) => {
	const q = url.searchParams.get('q') || undefined;
	const tag = url.searchParams.get('tag') || undefined;
	const sort = (url.searchParams.get('sort') || 'date') as 'date' | 'date_asc';
	const page = Number(url.searchParams.get('page')) || 1;

	const result = searchPage({ q, tag, sort, page, limit: 9 });
	return { ...result, query: q || '', activeTag: tag || '', sort, locale: params.locale, tags };
}
