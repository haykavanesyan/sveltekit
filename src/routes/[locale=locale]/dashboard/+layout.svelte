<script lang="ts">
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { getT } from '$lib/i18n/runtime';

	let { data, children }: {
		data: { user: { name: string; role: string }; locale: string };
		children?: import('svelte').Snippet;
	} = $props();

	const t = getT();
</script>

<SeoHead
	title={t('dashboard.title')}
	description="Your dashboard"
	locale={data.locale}
	path="/dashboard"
/>

<div class="mx-auto flex max-w-7xl gap-8 px-4 py-8">
	<nav class="hidden w-48 shrink-0 flex-col gap-2 md:flex" aria-label="Dashboard navigation">
		<a
			href="/{data.locale}/dashboard"
			class="rounded-md px-3 py-2 text-sm text-fg-muted hover:bg-bg-muted hover:text-fg"
		>
			{t('dashboard.title')}
		</a>
		<a
			href="/{data.locale}/dashboard/items"
			class="rounded-md px-3 py-2 text-sm text-fg-muted hover:bg-bg-muted hover:text-fg"
		>
			{t('dashboard.items.title')}
		</a>
	</nav>
	<main class="min-w-0 flex-1">
		{@render children?.()}
	</main>
</div>
