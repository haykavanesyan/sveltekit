import { posts } from '../database';
import type { Post } from '$lib/schemas/post';

export type SearchParams = {
	q?: string;
	tag?: string;
	sort?: 'date' | 'date_asc';
	cursor?: string;
	limit?: number;
	locale?: string;
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

export type PageResult = {
	items: Post[];
	page: number;
	totalPages: number;
	total: number;
};

export function getPage(locale: string, page: number, perPage: number = 6): PageResult {
	const filtered = getAll(locale);
	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / perPage));
	const start = (page - 1) * perPage;
	const items = filtered.slice(start, start + perPage);
	return { items, page, totalPages, total };
}

export function search(params: SearchParams): SearchResult {
	let filtered = [...posts];
	const { q, tag, sort, cursor, limit = 6, locale } = params;
	if (locale === 'en' || locale === 'de') {
		filtered = filtered.filter((p) => p.translations[locale]);
	}
	filtered = applySearchFilters(filtered, q, tag, sort);
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

function applySearchFilters(filtered: Post[], q?: string, tag?: string, sort?: string): Post[] {
	if (q) {
		const lower = q.toLowerCase();
		filtered = filtered.filter((p) => {
			const en = p.translations['en'];
			if (!en) return false;
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
	return filtered;
}

export function searchPage(params: SearchParams & { page?: number }): PageResult {
	const { q, tag, sort, page = 1, limit = 9 } = params;
	let filtered = [...posts];
	filtered = applySearchFilters(filtered, q, tag, sort);
	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const start = (page - 1) * limit;
	const items = filtered.slice(start, start + limit);
	return { items, page, totalPages, total };
}
