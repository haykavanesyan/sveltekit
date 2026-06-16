import { z } from 'zod';

const AuthorSchema = z.object({
	id: z.string(),
	name: z.string(),
	avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/)
});

const TranslationSchema = z.object({
	title: z.string().min(1),
	excerpt: z.string().min(1),
	body: z.string().min(1)
});

export const PostSchema = z.object({
	id: z.string().startsWith('post_'),
	slug: z.string().min(1),
	translations: z.record(z.enum(['en', 'de']), TranslationSchema),
	tags: z.array(z.string()),
	author: AuthorSchema,
	publishedAt: z.string().datetime(),
	readingTimeMinutes: z.number().int().positive(),
	coverColor: z.string().regex(/^#[0-9a-fA-F]{6}$/)
});

export const PostsArraySchema = z.array(PostSchema);

export type Post = z.infer<typeof PostSchema>;
