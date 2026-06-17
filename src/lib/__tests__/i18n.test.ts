import { describe, it, expect } from 'vitest';
import { createT } from '$lib/i18n/runtime.svelte';

const enDict = {
	hello: 'Hello',
	greeting: 'Hello, {name}!'
};

describe('createT', () => {
	it('returns simple key', () => {
		const t = createT('en' as const, enDict);
		expect(t('hello')).toBe('Hello');
	});

	it('interpolates variables', () => {
		const t = createT('en' as const, enDict);
		expect(t('greeting', { name: 'World' })).toBe('Hello, World!');
	});

	it('returns key for missing translation', () => {
		const t = createT('en' as const, enDict);
		expect(t('missing.key' as const)).toBe('missing.key');
	});
});
