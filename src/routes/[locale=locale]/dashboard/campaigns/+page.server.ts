import { ItemsFilterSchema } from '$lib/schemas/item';
import { getItems, getPageAsync } from '$lib/server/api/items';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ url }) => {
	const rawParams = Object.fromEntries(url.searchParams);
	const filter = ItemsFilterSchema.parse(rawParams);

	const { total, totalPages } = getItems(filter);
	const rowsPromise = getPageAsync(filter);

	return {
		filter,
		total,
		totalPages,
		streamed: { rows: rowsPromise }
	};
};
