import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const body = await request.json();
	console.log('[RUM]', JSON.stringify(body));
	return json({ ok: true });
}
