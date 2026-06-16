<script lang="ts">
	import Button from '$lib/components/primitives/Button.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Skeleton from '$lib/components/primitives/Skeleton.svelte';
	import { formatCurrency, formatPercent, formatDate } from '$lib/utils/formatters';
	import type { Item } from '$lib/schemas/item';

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

	const columns = [
		{ key: 'name', label: 'Name', sortable: true },
		{ key: 'status', label: 'Status', sortable: true },
		{ key: 'channel', label: 'Channel', sortable: true },
		{ key: 'owner', label: 'Owner', sortable: false },
		{ key: 'budget', label: 'Budget', sortable: true },
		{ key: 'spent', label: 'Spent', sortable: true },
		{ key: 'ctr', label: 'CTR', sortable: true },
		{ key: 'updatedAt', label: 'Updated', sortable: true }
	];

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
	<table class="w-full text-left text-sm" role="grid" aria-label="Campaigns table">
		<caption class="sr-only">Campaigns data table with sortable columns and inline edit</caption>
		<thead class="border-b border-border bg-bg-muted">
			<tr>
				{#each columns as col}
					<th
						scope="col"
						class="px-4 py-3 text-xs font-medium uppercase text-fg-muted"
						aria-sort={col.sortable && sortBy === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
					>
						{#if col.sortable}
							<button
								onclick={() => handleSort(col.key)}
								class="cursor-pointer font-medium text-fg-muted hover:text-fg"
								aria-label="Sort by {col.label}{sortBy === col.key ? ', currently ' + sortDir + 'ending' : ''}"
							>
								{col.label}{getSortIndicator(col.key)}
							</button>
						{:else}
							{col.label}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#if loading}
				{#each { length: 5 } as _}
					<tr class="border-b border-border">
						{#each columns as col}
							<td class="px-4 py-3"><Skeleton width="80%" height="1rem" /></td>
						{/each}
					</tr>
				{/each}
			{:else if rows.length === 0}
				<tr>
					<td colspan={columns.length} class="px-4 py-12 text-center text-fg-muted">
						No campaigns match your filters.
					</td>
				</tr>
			{:else}
				{#each rows as item (item.id)}
					<tr class="border-b border-border transition-colors hover:bg-bg-muted/50">
						<td class="px-4 py-3 font-medium text-fg">{item.name}</td>
						<td class="px-4 py-3">
							<Badge variant={statusVariant[item.status] || 'default'}>{item.status}</Badge>
						</td>
						<td class="px-4 py-3 text-fg">{item.channel}</td>
						<td class="px-4 py-3 text-fg-muted">{item.owner.name}</td>
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
										autofocus
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
						<td class="px-4 py-3 text-fg">{formatCurrency(item.spent, locale)}</td>
						<td class="px-4 py-3 text-fg">{formatPercent(item.ctr, locale)}</td>
						<td class="px-4 py-3 text-fg-muted">{formatDate(item.updatedAt, locale)}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

{#if totalPages > 1}
	<div class="mt-4 flex items-center justify-between">
		<p class="text-sm text-fg-muted">
			Page {page} of {totalPages} ({total} total)
		</p>
		<div class="flex items-center gap-2">
			<Button
				variant="secondary"
				size="sm"
				disabled={page <= 1}
				onclick={() => onpage?.(page - 1)}
				ariaLabel="Previous page"
			>
				&lsaquo; Prev
			</Button>
			{#each { length: Math.min(totalPages, 5) } as _, i}
				{@const p = i + 1}
				<button
					onclick={() => onpage?.(p)}
				class={[
					'h-8 w-8 cursor-pointer rounded-md text-sm font-medium transition-colors',
					p === page ? 'bg-primary text-fg-inverse' : 'text-fg-muted hover:bg-bg-muted hover:text-fg'
				].join(' ')}
					aria-label="Page {p}"
					aria-current={p === page ? 'page' : undefined}
				>
					{p}
				</button>
			{/each}
			<Button
				variant="secondary"
				size="sm"
				disabled={page >= totalPages}
				onclick={() => onpage?.(page + 1)}
				ariaLabel="Next page"
			>
				Next &rsaquo;
			</Button>
		</div>
	</div>
{/if}
