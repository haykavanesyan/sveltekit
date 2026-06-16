import { items } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const totalBudget = items.reduce((s, i) => s + i.budget, 0);
	const totalSpent = items.reduce((s, i) => s + i.spent, 0);
	const activeCount = items.filter((i) => i.status === 'active').length;
	const avgCtr = items.reduce((s, i) => s + i.ctr, 0) / items.length;

	return {
		stats: { totalBudget, totalSpent, activeCount, avgCtr },
		user: locals.user
	};
};
