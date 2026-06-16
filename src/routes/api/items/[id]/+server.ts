import { ItemPatchSchema } from '$lib/schemas/item';
import { updateItem, NotFoundError } from '$lib/server/api/items';
import { json } from '@sveltejs/kit';

export async function PATCH({ params, request, locals }) {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	if (locals.user.role === 'viewer') {
		return new Response('Forbidden', { status: 403 });
	}

	const body = await request.json();
	const parsed = ItemPatchSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
	}

	try {
		const updated = updateItem(params.id, parsed.data);
		return json(updated);
	} catch (e) {
		if (e instanceof NotFoundError) {
			return new Response('Not found', { status: 404 });
		}
		throw e;
	}
}
