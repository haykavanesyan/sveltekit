import { describe, it, expect } from 'vitest';
import { encodeItemsFilter, decodeItemsFilter } from '$lib/utils/url-state';

describe('url-state', () => {
	it('encodes and decodes a full filter', () => {
		const filter = { q: 'test', status: 'active', sortBy: 'budget', sortDir: 'asc' as const, page: 3, pageSize: 20 };
		const encoded = encodeItemsFilter(filter);
		const decoded = decodeItemsFilter(new URL(`http://x.com?${encoded}`));
		expect(decoded).toEqual({ ...filter, page: 3, pageSize: 20 });
	});

	it('decodes an empty URL to defaults', () => {
		const url = new URL('http://x.com');
		const decoded = decodeItemsFilter(url);
		expect(decoded.page).toBe(1);
		expect(decoded.pageSize).toBe(10);
	});
});
