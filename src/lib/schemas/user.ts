import { z } from 'zod';

export const UserSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	password: z.string().min(1),
	name: z.string().min(1),
	role: z.enum(['admin', 'editor', 'viewer'])
});

export const UsersArraySchema = z.array(UserSchema);

export type User = z.infer<typeof UserSchema>;
