import { ItemsFilterSchema } from '$lib/schemas/item';
import type { ItemsFilter } from '$lib/schemas/item';

export function encodeItemsFilter(filter: Partial<ItemsFilter>): URLSearchParams {
	const sp = new URLSearchParams();
	if (filter.q) sp.set('q', filter.q);
	if (filter.status) sp.set('status', filter.status);
	if (filter.channel) sp.set('channel', filter.channel);
	if (filter.ownerId) sp.set('ownerId', filter.ownerId);
	if (filter.sortBy) sp.set('sortBy', filter.sortBy);
	if (filter.sortDir) sp.set('sortDir', filter.sortDir);
	if (filter.page && filter.page > 1) sp.set('page', String(filter.page));
	if (filter.pageSize && filter.pageSize !== 10) sp.set('pageSize', String(filter.pageSize));
	return sp;
}

export function decodeItemsFilter(url: URL): ItemsFilter {
	const raw: Record<string, string> = {};
	for (const [k, v] of url.searchParams) {
		raw[k] = v;
	}
	const parsed = ItemsFilterSchema.parse(raw);
	return parsed;
}
