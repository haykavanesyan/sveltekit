<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import { page } from '$app/stores';
	import { createT } from '$lib/i18n/runtime';

	let locale = $derived(($page.params.locale as 'en' | 'de') || 'en');
	let t = $derived(createT(locale));
	let status = $derived($page.status);
	let message = $derived($page.error?.message || t('common.error'));
</script>

<svelte:head>
	<title>{status} — {message}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Container size="sm" class="py-20 text-center">
	<h1 class="text-6xl font-bold text-fg">{status}</h1>
	<p class="mt-4 text-lg text-fg-muted">{message}</p>
	<div class="mt-8 flex items-center justify-center gap-4">
		<a
			href="/{locale}"
			class="inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-fg-inverse transition-colors hover:bg-primary/90"
		>
			{t('home.hero.cta')}
		</a>
		<button
			onclick={() => location.reload()}
			class="inline-block rounded-md border border-border bg-bg px-6 py-3 text-sm font-medium text-fg transition-colors hover:bg-bg-muted"
		>
			{t('common.retry')}
		</button>
	</div>
</Container>
