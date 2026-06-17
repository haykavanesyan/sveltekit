<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/environment';

	let status = $derived($page.status);
	let is404 = $derived(status === 404);
	let message = $derived(
		is404
			? 'The page you\'re looking for doesn\'t exist.'
			: $page.error?.message || 'An unexpected error occurred.'
	);
</script>

<svelte:head>
	<title>{status} — {message}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-svh flex-col items-center justify-center bg-bg px-4 text-center">
	<h1 class="text-7xl font-bold text-fg">{status}</h1>
	<p class="mt-4 text-xl text-fg-muted">
		{is404 ? 'Page not found' : 'Something went wrong'}
	</p>
	<p class="mt-2 text-fg-muted">{message}</p>
	<div class="mt-8 flex items-center justify-center gap-4">
		<a
			href="/"
			class="inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
		>
			Go home
		</a>
		{#if !is404}
			<button
				onclick={() => location.reload()}
				class="inline-block rounded-md border border-border bg-bg px-6 py-3 text-sm font-medium text-fg transition-colors hover:bg-bg-muted"
			>
				Try again
			</button>
		{/if}
	</div>
	{#if dev}
		{@const err = $page.error as { stack?: string } | null}
		{#if err?.stack}
			<pre class="mt-8 max-w-2xl overflow-auto rounded-lg bg-bg-muted p-4 text-left text-xs text-fg-muted">{err.stack}</pre>
		{/if}
	{/if}
</div>
