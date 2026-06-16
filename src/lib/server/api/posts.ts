import { posts } from '../database';
import type { Post } from '$lib/schemas/post';

export type SearchParams = {
	q?: string;
	tag?: string;
	sort?: 'date' | 'date_asc';
	cursor?: string;
	limit?: number;
};

export type SearchResult = {
	posts: Post[];
	nextCursor: string | null;
};

export function getAll(locale?: string): Post[] {
	if (locale && (locale === 'en' || locale === 'de')) {
		return posts.filter((p) => p.translations[locale]);
	}
	return [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getBySlug(slug: string): Post | undefined {
	return posts.find((p) => p.slug === slug);
}

export function search(params: SearchParams): SearchResult {
	let filtered = [...posts];
	const { q, tag, sort, cursor, limit = 6 } = params;
	if (q) {
		const lower = q.toLowerCase();
		filtered = filtered.filter((p) => {
			const en = p.translations.en;
			return en.title.toLowerCase().includes(lower) || en.excerpt.toLowerCase().includes(lower);
		});
	}
	if (tag) {
		filtered = filtered.filter((p) => p.tags.includes(tag));
	}
	if (sort === 'date_asc') {
		filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
	} else {
		filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
	}
	if (cursor) {
		const cursorIdx = filtered.findIndex((p) => p.id === cursor);
		if (cursorIdx !== -1) {
			filtered = filtered.slice(cursorIdx + 1);
		}
	}
	const page = filtered.slice(0, limit);
	const nextCursor = filtered.length > limit ? page[page.length - 1]?.id ?? null : null;
	return { posts: page, nextCursor };
}
