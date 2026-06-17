<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Heading from '$lib/components/primitives/Heading.svelte';
	import Search from '$lib/components/composites/Search.svelte';
	import Select from '$lib/components/primitives/Select.svelte';
	import DataTable from '$lib/components/composites/DataTable.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { createT } from '$lib/i18n/runtime.svelte';
	import { decodeItemsFilter } from '$lib/utils/url-state';
	import { toast } from '$lib/stores/toast.svelte';
	import type { Item } from '$lib/schemas/item';
	import { page } from '$app/stores';
	import { goto, invalidate } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let { data }: {
		data: {
			filter: { q?: string; status?: string; sortBy?: string; sortDir?: 'asc' | 'desc'; page: number; pageSize: number };
			total: number;
			totalPages: number;
			streamed: { rows: Promise<Item[]> };
			user: { name: string; role: string };
			locale: string;
		}
	} = $props();

	let locale = $derived($page.params.locale);
	let t = $derived(createT(locale as 'en' | 'de'));

	let initialFilter = decodeItemsFilter($page.url);
	let filter = $state({ ...initialFilter, q: initialFilter.q ?? '' });
	let rows = $state<Item[]>([]);
	let loading = $state(true);

	// Sync filter when URL changes (e.g. back button)
	$effect(() => {
		const newFilter = decodeItemsFilter($page.url);
		// Only update if non-q fields changed
		const { q: _q, ...currentWithoutQ } = filter;
		const { q: _q2, ...newWithoutQ } = newFilter;
		if (JSON.stringify(newWithoutQ) !== JSON.stringify(currentWithoutQ)) {
			filter = { ...newFilter, q: filter.q };
		}
	});

	$effect(() => {
		const promise = data.streamed.rows;
		loading = true;
		promise.then((r) => {
			if (data.streamed.rows === promise) {
				rows = r;
				loading = false;
			}
		}).catch(() => {
			loading = false;
		});
	});

	function updateUrl() {
		const sp = new SvelteURLSearchParams();
		if (filter.q) sp.set('q', filter.q);
		if (filter.status) sp.set('status', filter.status);
		if (filter.sortBy) sp.set('sortBy', filter.sortBy);
		if (filter.sortDir && filter.sortDir !== 'desc') sp.set('sortDir', filter.sortDir);
		if (filter.page > 1) sp.set('page', String(filter.page));
		goto(`/${locale}/dashboard/campaigns?${sp}`, { replaceState: true, keepFocus: true });
	}

	function handleSort(column: string) {
		if (filter.sortBy === column) {
			filter.sortDir = filter.sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			filter.sortBy = column;
			filter.sortDir = 'desc';
		}
		filter.page = 1;
		updateUrl();
	}

	function handlePage(p: number) {
		filter.page = p;
		updateUrl();
	}

	async function handleEdit(item: Item, newBudget: number) {
		const prevBudget = item.budget;
		item.budget = newBudget;

		try {
			const res = await fetch(`/api/items/${item.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ budget: newBudget })
			});
			if (!res.ok) throw new Error('Patch failed');
			toast.add(t('campaigns.toast.updated'), 'success');
			await invalidate((url) => url.pathname.includes('/dashboard/campaigns'));
		} catch {
			item.budget = prevBudget;
			toast.add(t('campaigns.toast.failed'), 'error');
		}
	}

	const filterOptions = $derived([
		{ value: '', label: t('campaigns.filter.all') },
		{ value: 'active', label: t('campaigns.filter.active') },
		{ value: 'draft', label: t('campaigns.filter.draft') },
		{ value: 'scheduled', label: t('campaigns.filter.scheduled') },
		{ value: 'paused', label: t('campaigns.filter.paused') },
		{ value: 'completed', label: t('campaigns.filter.completed') },
		{ value: 'archived', label: t('campaigns.filter.archived') }
	]);
</script>

<SeoHead
	title={t('dashboard.items.title')}
	description={t('dashboard.description')}
	locale={locale as string}
	path="/dashboard/campaigns"
/>

<Container size="full" class="py-8">
	<div class="flex items-center justify-between">
		<div>
			<Heading level={1}>{t('dashboard.items.title')}</Heading>
		</div>
	</div>

	<div class="mt-6 flex flex-col gap-4 sm:flex-row">
		<div class="flex-1">
			<Search
				placeholder={t('search.placeholder')}
				bind:value={filter.q}
				onsearch={() => { updateUrl(); }}
			/>
		</div>
		<Select
			name="status"
			options={filterOptions}
			value={filter.status || ''}
			onchange={(e: CustomEvent<string>) => { filter.status = e.detail || undefined; filter.page = 1; updateUrl(); }}
		/>
	</div>

	<div class="mt-4">
		<DataTable
			bind:rows
			loading={loading}
			total={data.total}
			page={filter.page}
			totalPages={data.totalPages}
			sortBy={filter.sortBy ?? 'updatedAt'}
			sortDir={filter.sortDir ?? 'desc'}
			locale={locale}
			userRole={data.user?.role ?? 'viewer'}
			{t}
			onsort={handleSort}
			onpage={handlePage}
			onedit={handleEdit}
		/>
	</div>
</Container>
