import { describe, it, expect } from 'vitest';
import { LoginSchema } from '$lib/schemas/auth';
import { ItemPatchSchema } from '$lib/schemas/item';

describe('LoginSchema', () => {
	it('validates valid input', () => {
		const r = LoginSchema.safeParse({ email: 'admin@demo.test', password: 'password' });
		expect(r.success).toBe(true);
	});

	it('rejects missing email', () => {
		const r = LoginSchema.safeParse({ password: 'x' });
		expect(r.success).toBe(false);
	});

	it('rejects short password', () => {
		const r = LoginSchema.safeParse({ email: 'a@b.com', password: 'ab' });
		expect(r.success).toBe(false);
	});
});

describe('ItemPatchSchema', () => {
	it('validates budget update', () => {
		const r = ItemPatchSchema.safeParse({ budget: 5000 });
		expect(r.success).toBe(true);
	});

	it('rejects negative budget', () => {
		const r = ItemPatchSchema.safeParse({ budget: -1 });
		expect(r.success).toBe(false);
	});
});
