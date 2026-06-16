import { getContext, setContext } from 'svelte';
import { dictionaries } from './dictionaries';
import type { Dict } from './dictionaries';

export type Locale = 'en' | 'de';

const CTX_LOCALE = 'locale';
const CTX_T = 't';

export function setLocaleContext(locale: Locale) {
	setContext(CTX_LOCALE, locale);
	const t = createT(locale);
	setContext(CTX_T, t);
	return { locale, t };
}

export function getLocale(): Locale {
	return getContext<Locale>(CTX_LOCALE);
}

export function getT(): (key: string, params?: Record<string, string | number>) => string {
	return getContext<(key: string, params?: Record<string, string | number>) => string>(CTX_T);
}

export function createT(locale: Locale, dict?: Dict): (key: string, params?: Record<string, string | number>) => string {
	const resolved: Dict = dict || dictionaries[locale];
	return (key: string, params?: Record<string, string | number>) => {
		let value = resolved[key];
		if (!value) {
			value = key;
		}
		if (params) {
			for (const [k, v] of Object.entries(params)) {
				value = value.replace(`{${k}}`, String(v));
			}
		}
		return value;
	};
}

export function isValidLocale(value: string): value is Locale {
	return value === 'en' || value === 'de';
}
