<script lang="ts">
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { createT } from '$lib/i18n/runtime';
	import { page } from '$app/stores';

	let { data, children }: {
		data: { user: { name: string; role: string }; locale: string };
		children?: import('svelte').Snippet;
	} = $props();

	let locale = $derived($page.params.locale);
	let t = $derived(createT(locale as 'en' | 'de'));
</script>

<SeoHead
	title={t('dashboard.title')}
	description="Your dashboard"
	locale={locale}
	path="/dashboard"
/>

<div class="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row">
	<nav class="flex shrink-0 flex-row gap-4 overflow-x-auto border-b border-border pb-4 md:w-48 md:flex-col md:border-b-0 md:pb-0" aria-label="Dashboard navigation">
		<a
			href="/{locale}/dashboard"
			class={[
				'rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
				$page.url.pathname === `/${locale}/dashboard` 
					? 'bg-primary text-fg-inverse' 
					: 'text-fg-muted hover:bg-bg-muted hover:text-fg'
			].join(' ')}
		>
			{t('dashboard.title')}
		</a>
		<a
			href="/{locale}/dashboard/campaigns"
			class={[
				'rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
				$page.url.pathname.includes('/campaigns') 
					? 'bg-primary text-fg-inverse' 
					: 'text-fg-muted hover:bg-bg-muted hover:text-fg'
			].join(' ')}
		>
			{t('dashboard.items.title')}
		</a>
	</nav>
	<main class="min-w-0 flex-1">
		{@render children()}
	</main>
</div>
