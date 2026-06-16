import rawPosts from '$mocks/posts.json';
import rawItems from '$mocks/items.json';
import rawUsers from '$mocks/users.json';
import rawTags from '$mocks/tags.json';
import { PostsArraySchema } from '$lib/schemas/post';
import { ItemsArraySchema } from '$lib/schemas/item';
import { UsersArraySchema } from '$lib/schemas/user';
import { TagsArraySchema } from '$lib/schemas/tag';
import type { Post } from '$lib/schemas/post';
import type { Item } from '$lib/schemas/item';
import type { User } from '$lib/schemas/user';
import type { Tag } from '$lib/schemas/tag';

function validateOrThrow<T>(label: string, schema: { parse: (data: unknown) => T }, data: unknown): T {
	const result = schema.parse(data);
	return result;
}

export const posts: Post[] = validateOrThrow('posts.json', PostsArraySchema, rawPosts);
export const items: Item[] = validateOrThrow('items.json', ItemsArraySchema, rawItems);
export const users: User[] = validateOrThrow('users.json', UsersArraySchema, rawUsers);
export const tags: Tag[] = validateOrThrow('tags.json', TagsArraySchema, rawTags);
