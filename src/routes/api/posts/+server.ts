import { search } from '$lib/server/api/posts';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = ({ url }) => {
	const q = url.searchParams.get('q') || undefined;
	const tag = url.searchParams.get('tag') || undefined;
	const cursor = url.searchParams.get('cursor') || undefined;
	const sort = (url.searchParams.get('sort') || 'date') as 'date' | 'date_asc';
	const limit = Number(url.searchParams.get('limit')) || 6;

	const result = search({ q, tag, cursor, sort, limit });
	return json(result);
};
