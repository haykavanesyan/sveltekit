import { getBySlug } from '$lib/server/api/posts';
import { posts, tags } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';

export const prerender = true;

export function entries(): ReturnType<EntryGenerator> {
	const slugs: { slug: string; locale: 'en' | 'de' }[] = [];
	const locales = ['en', 'de'] as const;
	for (const locale of locales) {
		for (const post of posts) {
			slugs.push({ slug: post.slug, locale });
		}
	}
	return slugs;
}

export function load({ params }: { params: { slug: string; locale: string } }) {
	const post = getBySlug(params.slug);
	if (!post) {
		throw error(404, 'Not found');
	}
	return { post, locale: params.locale, tags };
}
