import { posts } from '$lib/server/database';

const BASE = 'https://example.com';
const LOCALES = ['en', 'de'];

export const prerender = true;

export async function GET() {
	const lines: string[] = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
	];

	for (const locale of LOCALES) {
		const otherLocale = LOCALES.find((l) => l !== locale)!;

		lines.push(...genEntry(locale, '', '1.0', 'monthly', otherLocale));
		lines.push(...genEntry(locale, '/search', '0.6', 'monthly', otherLocale));
		lines.push(...genEntry(locale, '/blog', '0.8', 'weekly', otherLocale));

		for (const post of posts) {
			lines.push(...genEntry(locale, `/blog/${post.slug}`, '0.6', 'monthly', otherLocale, post.publishedAt));
		}
	}

	lines.push('</urlset>');

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'application/xml' }
	});
}

function genUrl(locale: string, path: string): string {
	return `${BASE}/${locale}${path}`;
}

function genEntry(
	locale: string,
	path: string,
	priority: string,
	changefreq: string,
	otherLocale: string,
	lastmod?: string
): string[] {
	const loc = genUrl(locale, path);
	const otherLoc = genUrl(otherLocale, path);
	const lines = [
		'  <url>',
		`    <loc>${loc}</loc>`,
		`    <xhtml:link rel="alternate" hreflang="${locale}" href="${loc}" />`,
		`    <xhtml:link rel="alternate" hreflang="${otherLocale}" href="${otherLoc}" />`,
		`    <xhtml:link rel="alternate" hreflang="x-default" href="${genUrl('en', path)}" />`,
		`    <priority>${priority}</priority>`,
		`    <changefreq>${changefreq}</changefreq>`
	];
	if (lastmod) {
		lines.push(`    <lastmod>${lastmod.replace(/\.\d+Z$/, '')}</lastmod>`);
	}
	lines.push('  </url>');
	return lines;
}
