import { describe, it, expect } from 'vitest';
import { getItems, getPageAsync, updateItem, NotFoundError } from '$lib/server/api/items';

describe('items API', () => {
	it('returns paginated items with correct total', () => {
		const result = getItems({ page: 1, pageSize: 5, q: '', status: '', sortBy: 'updatedAt', sortDir: 'desc' });
		expect(result.items.length).toBeLessThanOrEqual(5);
		expect(result.total).toBeGreaterThan(0);
	});

	it('filters by status', () => {
		const result = getItems({ page: 1, pageSize: 50, q: '', status: 'active', sortBy: 'updatedAt', sortDir: 'desc' });
		expect(result.items.every((i) => i.status === 'active')).toBe(true);
	});

	it('updates item budget', () => {
		const updated = updateItem('cmp_0001', { budget: 99999 });
		expect(updated.budget).toBe(99999);
	});

	it('throws NotFoundError for missing item', () => {
		expect(() => updateItem('nonexistent', { budget: 0 })).toThrow(NotFoundError);
	});

	it('getPageAsync resolves after delay', async () => {
		const rows = await getPageAsync({ page: 1, pageSize: 3, q: '', status: '', sortBy: 'updatedAt', sortDir: 'desc' });
		expect(rows.length).toBe(3);
	});
});
