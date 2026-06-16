import { posts } from '$lib/server/database';

const BASE = 'https://demo-sveltekit.vercel.app';
const LOCALES = ['en', 'de'];

export async function GET() {
	const urls: string[] = [];

	for (const locale of LOCALES) {
		urls.push(genUrl(locale, ''));
		urls.push(genUrl(locale, '/login'));
		urls.push(genUrl(locale, '/search'));
		urls.push(genUrl(locale, '/blog'));

		for (const post of posts) {
			urls.push(genUrl(locale, `/blog/${post.slug}`));
		}
	}

	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls.map((u) => `  <url><loc>${u}</loc></url>`),
		'</urlset>'
	].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}

function genUrl(locale: string, path: string): string {
	return `${BASE}/${locale}${path}`;
}
