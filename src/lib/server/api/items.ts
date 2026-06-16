import { items as itemsStore } from '../database';
import type { Item, ItemsFilter, ItemPatch } from '$lib/schemas/item';

export class NotFoundError extends Error {
	constructor(msg: string) {
		super(msg);
		this.name = 'NotFoundError';
	}
}

export function getItems(filter: ItemsFilter): {
	items: Item[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
} {
	const { q, status, channel, ownerId, sortBy, sortDir, page, pageSize } = filter;
	let filtered = [...itemsStore];
	if (q) {
		const lower = q.toLowerCase();
		filtered = filtered.filter((i) => i.name.toLowerCase().includes(lower));
	}
	if (status) {
		filtered = filtered.filter((i) => i.status === status);
	}
	if (channel) {
		filtered = filtered.filter((i) => i.channel === channel);
	}
	if (ownerId) {
		filtered = filtered.filter((i) => i.owner.id === ownerId);
	}
	const sortField = sortBy || 'updatedAt';
	const dir = sortDir || 'desc';
	filtered.sort((a, b) => {
		let cmp = 0;
		switch (sortField) {
			case 'name':
				cmp = a.name.localeCompare(b.name);
				break;
			case 'status':
				cmp = a.status.localeCompare(b.status);
				break;
			case 'channel':
				cmp = a.channel.localeCompare(b.channel);
				break;
			case 'owner':
				cmp = a.owner.name.localeCompare(b.owner.name);
				break;
			case 'budget':
				cmp = a.budget - b.budget;
				break;
			case 'spent':
				cmp = a.spent - b.spent;
				break;
			case 'ctr':
				cmp = a.ctr - b.ctr;
				break;
			case 'updatedAt':
				cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
				break;
			default:
				cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
				break;
		}
		return dir === 'asc' ? cmp : -cmp;
	});
	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const start = (page - 1) * pageSize;
	const pageItems = filtered.slice(start, start + pageSize);
	return { items: pageItems, total, page, pageSize, totalPages };
}

export function getCount(filter: ItemsFilter): { total: number; totalPages: number } {
	const { items, total, totalPages } = getItems(filter);
	return { total, totalPages };
}

export function getPageAsync(filter: ItemsFilter): Promise<Item[]> {
	const { items } = getItems(filter);
	return new Promise((resolve) => {
		setTimeout(() => resolve(items), 200);
	});
}

export function updateItem(id: string, patch: ItemPatch): Item {
	const idx = itemsStore.findIndex((i) => i.id === id);
	if (idx === -1) {
		throw new NotFoundError(`Item ${id} not found`);
	}
	const updated = { ...itemsStore[idx], ...patch };
	itemsStore[idx] = updated;
	return updated;
}
