import en from '$mocks/i18n.en.json';
import de from '$mocks/i18n.de.json';
import type { Locale } from './runtime';

export type Dict = Record<string, string>;

export const dictionaries: Record<Locale, Dict> = { en, de };
