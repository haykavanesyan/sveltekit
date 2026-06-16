<script lang="ts">
	import Heading from '$lib/components/primitives/Heading.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import { getT } from '$lib/i18n/runtime';

	let { data }: { data: { stats: { totalBudget: number; totalSpent: number; activeCount: number; avgCtr: number }; user: { name: string; role: string }; locale: string } } = $props();

	const t = getT();
	const { totalBudget, totalSpent, activeCount, avgCtr } = data.stats;
</script>

<Heading level={1}>{t('dashboard.title')}</Heading>
<p class="mt-1 text-sm text-fg-muted">Welcome back, {data.user.name}</p>

<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<Card>
		<p class="text-sm text-fg-muted">Total Budget</p>
		<p class="mt-1 text-2xl font-bold text-fg">${(totalBudget / 1000).toFixed(0)}k</p>
	</Card>
	<Card>
		<p class="text-sm text-fg-muted">Total Spent</p>
		<p class="mt-1 text-2xl font-bold text-fg">${(totalSpent / 1000).toFixed(0)}k</p>
	</Card>
	<Card>
		<p class="text-sm text-fg-muted">Active Campaigns</p>
		<p class="mt-1 text-2xl font-bold text-fg">{activeCount}</p>
	</Card>
	<Card>
		<p class="text-sm text-fg-muted">Avg CTR</p>
		<p class="mt-1 text-2xl font-bold text-fg">{(avgCtr * 100).toFixed(2)}%</p>
	</Card>
</div>
