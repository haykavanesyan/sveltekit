export function initErrorReporting(): void {
	window.onerror = (message, _source, _lineno, _colno, error) => {
		navigator.sendBeacon(
			'/api/beacon',
			JSON.stringify({
				type: 'error',
				message,
				stack: error?.stack,
				url: location.href,
				timestamp: Date.now()
			})
		);
	};

	window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
		navigator.sendBeacon(
			'/api/beacon',
			JSON.stringify({
				type: 'unhandledrejection',
				reason: e.reason?.message ?? String(e.reason),
				stack: e.reason?.stack,
				timestamp: Date.now()
			})
		);
	});
}
