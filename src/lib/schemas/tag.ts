import { z } from 'zod';

export const TagSchema = z.object({
	slug: z.string(),
	label: z.object({
		en: z.string(),
		de: z.string()
	})
});

export const TagsArraySchema = z.array(TagSchema);

export type Tag = z.infer<typeof TagSchema>;
