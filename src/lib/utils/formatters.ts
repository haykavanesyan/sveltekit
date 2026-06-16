export function formatDate(dateStr: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(dateStr));
}

export function formatCurrency(amount: number, locale: string): string {
	return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatPercent(value: number, locale: string): string {
	return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 2 }).format(value);
}
