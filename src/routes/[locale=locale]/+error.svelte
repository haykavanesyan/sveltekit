<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import { page } from '$app/stores';
	import { createT } from '$lib/i18n/runtime.svelte';

	let locale = $derived(($page.params.locale as 'en' | 'de') || 'en');
	let t = $derived(createT(locale));
	let status = $derived($page.status);
	let is404 = $derived(status === 404);
	let message = $derived(
		is404
			? t('error.notFoundMessage')
			: $page.error?.message || t('error.genericMessage')
	);
</script>

<svelte:head>
	<title>{status} — {message}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Container size="sm" class="py-20 text-center">
	<h1 class="text-7xl font-bold text-fg">{status}</h1>
	<p class="mt-4 text-xl text-fg-muted">
		{is404 ? t('error.pageNotFound') : t('error.somethingWentWrong')}
	</p>
	<p class="mt-2 text-fg-muted">{message}</p>
	<div class="mt-8 flex items-center justify-center gap-4">
		<a
			href="/{locale}"
			class="inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-fg-inverse transition-colors hover:bg-primary/90"
		>
			{t('home.hero.cta')}
		</a>
		{#if !is404}
			<button
				onclick={() => location.reload()}
				class="inline-block rounded-md border border-border bg-bg px-6 py-3 text-sm font-medium text-fg transition-colors hover:bg-bg-muted"
			>
				{t('common.retry')}
			</button>
		{/if}
	</div>
</Container>
