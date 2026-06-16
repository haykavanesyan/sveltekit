<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Heading from '$lib/components/primitives/Heading.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Select from '$lib/components/primitives/Select.svelte';
	import DataTable from '$lib/components/composites/DataTable.svelte';
	import { getT } from '$lib/i18n/runtime';
	import { decodeItemsFilter } from '$lib/utils/url-state';
	import { ItemsFilterSchema } from '$lib/schemas/item';
	import type { Item } from '$lib/schemas/item';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

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

	const t = getT();

	let filter = $state(decodeItemsFilter($page.url));
	let rows = $state<Item[]>([]);
	let loading = $state(true);

	$effect(() => {
		data.streamed.rows.then((r) => {
			rows = r;
			loading = false;
		});
	});

	function updateUrl() {
		const sp = new URLSearchParams();
		if (filter.q) sp.set('q', filter.q);
		if (filter.status) sp.set('status', filter.status);
		if (filter.sortBy && filter.sortBy !== 'updatedAt') sp.set('sortBy', filter.sortBy);
		if (filter.sortDir && filter.sortDir !== 'desc') sp.set('sortDir', filter.sortDir);
		if (filter.page > 1) sp.set('page', String(filter.page));
		goto(`/${data.locale}/dashboard/items?${sp}`, { replaceState: true, keepFocus: true });
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
		} catch {
			item.budget = prevBudget;
		}
	}

	const filterOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'active', label: 'Active' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'scheduled', label: 'Scheduled' },
		{ value: 'paused', label: 'Paused' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'archived', label: 'Archived' }
	];
</script>

<Container size="full" class="py-8">
	<div class="flex items-center justify-between">
		<div>
			<Heading level={1}>{t('dashboard.items.title')}</Heading>
			<p class="mt-1 text-sm text-fg-muted">{t('dashboard.items.description')}</p>
		</div>
	</div>

	<div class="mt-6 flex flex-col gap-4 sm:flex-row">
		<div class="flex-1">
			<Input
				name="q"
				placeholder={t('search.placeholder')}
				value={filter.q ?? ''}
				oninput={(e) => { filter.q = (e.target as HTMLInputElement).value; updateUrl(); }}
			/>
		</div>
		<Select
			name="status"
			options={filterOptions}
			value={filter.status ?? ''}
			onchange={(e) => { filter.status = (e.target as HTMLSelectElement).value; filter.page = 1; updateUrl(); }}
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
			locale={data.locale}
			userRole={data.user.role}
			onsort={handleSort}
			onpage={handlePage}
			onedit={handleEdit}
		/>
	</div>
</Container>
