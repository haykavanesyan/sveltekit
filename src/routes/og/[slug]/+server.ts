import { getBySlug } from '$lib/server/api/posts';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
	return ['en', 'de'].flatMap((locale) =>
		['sub-second-lcp', 'pragmatic-design-tokens', 'spa-default', 'accessible-combobox', 'form-library',
		 'streaming-ssr', 'error-states', 'edge-node-comparison', 'bundle-size', 'keyboard-first',
		 'extra-round-trip', 'shipping-ai', 'performance', 'design-tokens', 'engineering',
		 'tutorials', 'product', 'culture', 'accessibility', 'testing'].map((slug) => ({ slug }))
	);
}

export function GET({ params }: { params: { slug: string } }) {
	const post = getBySlug(params.slug);
	if (!post) throw error(404, 'Not found');

	const title = post.translations['en']?.title || post.slug;
	const name = post.author.name;
	const time = `${post.readingTimeMinutes} min read`;
	const bg = post.coverColor;

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
		<rect width="1200" height="630" fill="${bg}"/>
		<rect y="460" width="1200" height="170" fill="rgba(0,0,0,0.15)"/>
		<text x="60" y="440" font-family="system-ui,sans-serif" font-size="48" font-weight="700" fill="white">
			${escapeXml(title)}
		</text>
		<text x="60" y="540" font-family="system-ui,sans-serif" font-size="28" fill="rgba(255,255,255,0.9)">
			${escapeXml(name)} · ${escapeXml(time)}
		</text>
		<text x="1140" y="80" font-family="system-ui,sans-serif" font-size="24" font-weight="600" fill="rgba(255,255,255,0.8)" text-anchor="end">
			Demo Co.
		</text>
	</svg>`;

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
}

function escapeXml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
