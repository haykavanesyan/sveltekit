import { getAll } from '$lib/server/api/posts';
import { tags } from '$lib/server/database';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	return [{ locale: 'en' }, { locale: 'de' }];
};

export const load: PageServerLoad = ({ params }) => {
	const locale = params.locale as 'en' | 'de';
	const allPosts = getAll(locale);
	const items = allPosts.slice(0, 6);
	const nextCursor = allPosts.length > 6 ? allPosts[5].id : null;
	return { items, total: allPosts.length, nextCursor, locale, tags };
};
