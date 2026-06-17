<script lang="ts">
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Skeleton from '$lib/components/primitives/Skeleton.svelte';
	import { formatCurrency, formatPercent, formatDate } from '$lib/utils/formatters';
	import type { Item } from '$lib/schemas/item';
	import Pagination from './Pagination.svelte';

	let {
		rows = $bindable([]),
		loading = false,
		total = 0,
		page = 1,
		totalPages = 1,
		sortBy = 'updatedAt',
		sortDir = 'desc' as 'asc' | 'desc',
		locale = 'en',
		userRole = 'viewer',
		t,
		onsort,
		onpage,
		onedit
	}: {
		rows: Item[];
		loading?: boolean;
		total?: number;
		page?: number;
		totalPages?: number;
		sortBy?: string;
		sortDir?: 'asc' | 'desc';
		locale?: string;
		userRole?: string;
		t?: (key: string, params?: Record<string, string | number>) => string;
		onsort?: (column: string) => void;
		onpage?: (p: number) => void;
		onedit?: (item: Item, budget: number) => void;
	} = $props();

	let editingId = $state<string | null>(null);
	let editValue = $state<number>(0);
	let previousValue = $state<number>(0);

	function startEdit(item: Item) {
		if (userRole === 'viewer') return;
		editingId = item.id;
		editValue = item.budget;
		previousValue = item.budget;
	}

	function cancelEdit() {
		const item = rows.find((r) => r.id === editingId);
		if (item) item.budget = previousValue;
		editingId = null;
	}

	function saveEdit(item: Item) {
		if (editingId !== item.id) return;
		if (onedit) onedit(item, editValue);
		editingId = null;
	}

	function handleKeydown(e: KeyboardEvent, item: Item) {
		if (e.key === 'Enter') saveEdit(item);
		if (e.key === 'Escape') cancelEdit();
	}

	function handleSort(column: string) {
		if (onsort) onsort(column);
	}

	function getSortIndicator(column: string): string {
		if (sortBy !== column) return '';
		return sortDir === 'asc' ? ' ▲' : ' ▼';
	}

	function translate(key: string): string {
		return t ? t(key) : key;
	}

	const columns = $derived([
		{ key: 'name', label: translate('dashboard.items.column.name'), sortable: true, mobile: true },
		{ key: 'status', label: translate('dashboard.items.column.status'), sortable: true, mobile: true },
		{ key: 'channel', label: translate('dashboard.items.column.channel'), sortable: true, mobile: false },
		{ key: 'owner', label: translate('dashboard.items.column.owner'), sortable: true, mobile: false },
		{ key: 'budget', label: translate('dashboard.items.column.budget'), sortable: true, mobile: true },
		{ key: 'spent', label: translate('dashboard.items.column.spent'), sortable: true, mobile: false },
		{ key: 'ctr', label: translate('dashboard.items.column.ctr'), sortable: true, mobile: false },
		{ key: 'updatedAt', label: translate('dashboard.items.column.updated'), sortable: true, mobile: false }
	]);

	const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
		active: 'success',
		draft: 'default',
		scheduled: 'info',
		paused: 'warning',
		completed: 'info',
		archived: 'default'
	};
</script>

<div class="overflow-x-auto rounded-lg border border-border">
	<table class="w-full table-fixed text-left text-sm" role="grid" aria-label={t ? t('dataTable.ariaLabel') : 'Campaigns table'}>
		<caption class="sr-only">{t ? t('dataTable.caption') : 'Campaigns data table with sortable columns and inline edit'}</caption>
		<thead class="border-b border-border bg-bg-muted">
			<tr>
				{#each columns as col (col.key)}
					<th
						scope="col"
						class={[
							'px-4 py-3 text-xs font-medium uppercase text-fg-muted truncate',
							!col.mobile && 'hidden lg:table-cell'
						].filter(Boolean).join(' ')}
						aria-sort={col.sortable && sortBy === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
					>
						{#if col.sortable}
							<button
								onclick={() => handleSort(col.key)}
								class="flex w-full cursor-pointer items-center justify-between font-medium text-fg-muted hover:text-fg"
								aria-label="Sort by {col.label}{sortBy === col.key ? `, currently ${sortDir}ending` : ''}"
							>
								<span class="truncate">{col.label}</span>
								<span class="ml-2 shrink-0 text-[0.6em]">{getSortIndicator(col.key)}</span>
							</button>
						{:else}
							<span class="truncate">{col.label}</span>
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#if loading}
				{#each { length: 5 } as _, i (i)}
					<tr class="border-b border-border">
						{#each columns as col (col.key)}
							<td class={["px-4 py-3", !col.mobile && "hidden lg:table-cell"].filter(Boolean).join(' ')}><Skeleton width="80%" height="1rem" /></td>
						{/each}
					</tr>
				{/each}
			{:else if rows.length === 0}
				<tr>
					<td colspan={columns.length} class="px-4 py-12 text-center text-fg-muted">
						{t ? t('campaigns.empty') : 'No campaigns match your filters.'}
					</td>
				</tr>
			{:else}
				{#each rows as item (item.id)}
					<tr class="border-b border-border transition-colors hover:bg-bg-muted/50">
						<td class="px-4 py-3 font-medium text-fg">{item.name}</td>
						<td class="px-4 py-3">
							<Badge variant={statusVariant[item.status] || 'default'}>{item.status}</Badge>
						</td>
						<td class="hidden px-4 py-3 text-fg lg:table-cell">{item.channel}</td>
						<td class="hidden px-4 py-3 text-fg-muted lg:table-cell">{item.owner.name}</td>
						<td class="px-4 py-3">
							{#if editingId === item.id}
								<div class="flex items-center gap-1">
									<span class="text-fg-muted">$</span>
									<input
										type="number"
										bind:value={editValue}
										onkeydown={(e) => handleKeydown(e, item)}
										onblur={() => saveEdit(item)}
										class="h-8 w-24 rounded border border-primary bg-bg px-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
										step="0.01"
										min="0"
										aria-label="Edit budget for {item.name}"
									/>
								</div>
							{:else}
								<button
									data-editable="true"
									onclick={() => startEdit(item)}
									class="cursor-pointer rounded px-1 py-0.5 text-fg transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-50"
									disabled={userRole === 'viewer'}
									aria-label="Edit budget for {item.name}, current value {formatCurrency(item.budget, locale)}"
								>
									{formatCurrency(item.budget, locale)}
								</button>
							{/if}
						</td>
						<td class="hidden px-4 py-3 text-fg lg:table-cell">{formatCurrency(item.spent, locale)}</td>
						<td class="hidden px-4 py-3 text-fg lg:table-cell">{formatPercent(item.ctr, locale)}</td>
						<td class="hidden px-4 py-3 text-fg-muted lg:table-cell">{formatDate(item.updatedAt, locale)}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<Pagination {page} {totalPages} {total} onpage={onpage} />
