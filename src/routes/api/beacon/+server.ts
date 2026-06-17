import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	console.log('[RUM]', JSON.stringify(body));
	return json({ ok: true });
};
