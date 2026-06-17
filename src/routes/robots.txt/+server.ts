export const prerender = true;

export async function GET() {
	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /api/',
		'Disallow: /dashboard/',
		'',
		'Sitemap: https://example.com/sitemap.xml'
	].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' }
	});
}
