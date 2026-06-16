import { z } from 'zod';

const OwnerSchema = z.object({
	id: z.string(),
	name: z.string()
});

export const ItemSchema = z.object({
	id: z.string().startsWith('cmp_'),
	name: z.string().min(1),
	status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived']),
	channel: z.enum(['email', 'sms', 'web', 'social', 'push']),
	owner: OwnerSchema,
	budget: z.number().nonnegative(),
	spent: z.number().nonnegative(),
	impressions: z.number().int().nonnegative(),
	clicks: z.number().int().nonnegative(),
	ctr: z.number().min(0).max(1),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	updatedAt: z.string().datetime(),
	tags: z.array(z.string())
});

export const ItemsArraySchema = z.array(ItemSchema);

export const ItemsFilterSchema = z.object({
	q: z.string().optional(),
	status: z.string().optional(),
	channel: z.string().optional(),
	ownerId: z.string().optional(),
	sortBy: z.string().optional(),
	sortDir: z.enum(['asc', 'desc']).optional(),
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export const ItemPatchSchema = z.object({
	budget: z.number().nonnegative().optional(),
	name: z.string().min(1).optional(),
	status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived']).optional()
});

export type Item = z.infer<typeof ItemSchema>;
export type ItemsFilter = z.infer<typeof ItemsFilterSchema>;
export type ItemPatch = z.infer<typeof ItemPatchSchema>;
