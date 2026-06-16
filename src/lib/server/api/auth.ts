import { users } from '../database';
import type { User } from '$lib/schemas/user';

type Session = {
	userId: string;
	expiresAt: number;
};

const sessions = new Map<string, Session>();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export function verifyCredentials(email: string, password: string): User | null {
	const user = users.find((u) => u.email === email && u.password === password);
	return user ?? null;
}

export function createSession(userId: string): string {
	const token = crypto.randomUUID();
	sessions.set(token, {
		userId,
		expiresAt: Date.now() + SESSION_DURATION_MS
	});
	return token;
}

export function getSession(token: string): Session | null {
	const session = sessions.get(token);
	if (!session) return null;
	if (Date.now() > session.expiresAt) {
		sessions.delete(token);
		return null;
	}
	return session;
}

export function destroySession(token: string): void {
	sessions.delete(token);
}
