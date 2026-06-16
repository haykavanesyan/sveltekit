import { getAll } from '$lib/server/api/posts';
import { tags } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const prerender = true;

export function load({ params }) {
	const posts = getAll(params.locale);
	const firstPage = posts.slice(0, 6);
	const nextCursor = posts.length > 6 ? posts[5].id : null;
	return { posts: firstPage, nextCursor, total: posts.length, locale: params.locale, tags };
}
