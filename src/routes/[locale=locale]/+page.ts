import type { EntryGenerator } from './$types';

export const prerender = true;
export const ssr = true;

export const entries: EntryGenerator = () => {
	return [{ locale: 'en' }, { locale: 'de' }];
};
