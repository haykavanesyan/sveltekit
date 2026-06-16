export async function GET() {
	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /api/',
		'Disallow: /dashboard/',
		'',
		`Sitemap: https://demo-sveltekit.vercel.app/sitemap.xml`
	].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' }
	});
}
