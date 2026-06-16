import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals';

type MetricPayload = {
	name: string;
	value: number;
	rating: string;
	url: string;
	locale: string;
	timestamp: number;
};

export function initWebVitals(sampleRate: number = 0.1): void {
	if (Math.random() > sampleRate) return;

	const send = (metric: { name: string; value: number; rating: string }) => {
		const body: MetricPayload = {
			name: metric.name,
			value: metric.value,
			rating: metric.rating,
			url: location.pathname,
			locale: document.documentElement.lang,
			timestamp: Date.now()
		};
		navigator.sendBeacon('/api/beacon', JSON.stringify(body));
	};

	onLCP(send);
	onINP(send);
	onCLS(send);
	onTTFB(send);
}
