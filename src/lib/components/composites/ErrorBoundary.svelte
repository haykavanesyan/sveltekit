<script lang="ts">
	import { browser } from '$app/environment';

	let { children, fallback }: {
		children?: import('svelte').Snippet;
		fallback?: import('svelte').Snippet<[error: unknown]>;
	} = $props();

	let hasError = $state(false);
	let caught: unknown = $state(null);

	if (browser) {
		$effect(() => {
			function onError(event: ErrorEvent) {
				event.preventDefault();
				hasError = true;
				caught = event.error ?? event.message;
				fetch('/api/beacon', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						type: 'error',
						message: event.message,
						stack: event.error?.stack,
						url: location.href,
						timestamp: new Date().toISOString()
					})
				}).catch(() => {});
			}

			function onRejection(event: PromiseRejectionEvent) {
				event.preventDefault();
				hasError = true;
				caught = event.reason;
				fetch('/api/beacon', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						type: 'unhandledrejection',
						message: event.reason?.message ?? String(event.reason),
						stack: event.reason?.stack,
						url: location.href,
						timestamp: new Date().toISOString()
					})
				}).catch(() => {});
			}

			window.addEventListener('error', onError);
			window.addEventListener('unhandledrejection', onRejection);
			return () => {
				window.removeEventListener('error', onError);
				window.removeEventListener('unhandledrejection', onRejection);
			};
		});
	}
</script>

{#if hasError}
	{#if fallback}
		{@render fallback(caught)}
	{:else}
		<div role="alert" class="flex flex-col items-center justify-center gap-4 p-8 text-center">
			<p class="text-lg font-semibold text-danger">Something went wrong</p>
			<p class="text-sm text-fg-muted">An unexpected error occurred. Please try refreshing the page.</p>
			<button
				onclick={() => location.reload()}
				class="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
			>
				Refresh page
			</button>
		</div>
	{/if}
{:else}
	{@render children?.()}
{/if}
