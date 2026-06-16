import { z } from 'zod';

export const LoginSchema = z.object({
	email: z.string().email('Enter a valid email'),
	password: z.string().min(3, 'Password must be at least 3 characters')
});

export type LoginData = z.infer<typeof LoginSchema>;
