export function match(value: string): value is 'en' | 'de' {
	return value === 'en' || value === 'de';
}
