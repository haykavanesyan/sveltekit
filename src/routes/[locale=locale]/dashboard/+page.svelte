<script lang="ts">
	import Heading from '$lib/components/primitives/Heading.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { createT } from '$lib/i18n/runtime.svelte';
	import { page } from '$app/stores';

	let { data }: { data: { stats: { totalBudget: number; totalSpent: number; activeCount: number; avgCtr: number }; user: { name: string; role: string }; locale: string } } = $props();

	let locale = $derived($page.params.locale);
	let t = $derived(createT(locale as 'en' | 'de'));
	let stats = $derived(data.stats);
	let { totalBudget, totalSpent, activeCount, avgCtr } = $derived(stats);
</script>

<SeoHead
	title={t('dashboard.title')}
	description={t('dashboard.description')}
	locale={locale as string}
	path="/dashboard"
/>

<Heading level={1}>{t('dashboard.title')}</Heading>
<p class="mt-1 text-sm text-fg-muted">{t('dashboard.welcomeBack', { name: data.user.name })}</p>

<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<Card>
		<p class="text-sm text-fg-muted">{t('dashboard.stat.totalBudget')}</p>
		<p class="mt-1 text-2xl font-bold text-fg">${(totalBudget / 1000).toFixed(0)}k</p>
	</Card>
	<Card>
		<p class="text-sm text-fg-muted">{t('dashboard.stat.totalSpent')}</p>
		<p class="mt-1 text-2xl font-bold text-fg">${(totalSpent / 1000).toFixed(0)}k</p>
	</Card>
	<Card>
		<p class="text-sm text-fg-muted">{t('dashboard.stat.activeCount')}</p>
		<p class="mt-1 text-2xl font-bold text-fg">{activeCount}</p>
	</Card>
	<Card>
		<p class="text-sm text-fg-muted">{t('dashboard.stat.avgCtr')}</p>
		<p class="mt-1 text-2xl font-bold text-fg">{(avgCtr * 100).toFixed(2)}%</p>
	</Card>
</div>
