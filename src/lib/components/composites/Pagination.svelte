<script lang="ts">
	let { page = 1, totalPages = 1, total = 0, onpage }: {
		page: number;
		totalPages: number;
		total?: number;
		onpage?: (p: number) => void;
	} = $props();

	function visiblePages(): number[] {
		const pages: number[] = [];
		const maxVisible = 5;
		let start = Math.max(1, page - Math.floor(maxVisible / 2));
		let end = Math.min(totalPages, start + maxVisible - 1);
		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	}
</script>

{#if totalPages > 1}
	<nav class="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
		<button
			onclick={() => onpage?.(page - 1)}
			disabled={page <= 1}
			class="inline-flex h-9 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-border bg-bg text-fg hover:bg-bg-muted"
			aria-label="Previous page"
		>
			&lsaquo; Prev
		</button>

		{#each visiblePages() as p}
			<button
				onclick={() => onpage?.(p)}
				class={[
					'h-9 w-9 cursor-pointer rounded-md text-sm font-medium transition-colors',
					p === page ? 'bg-primary text-fg-inverse' : 'text-fg-muted hover:bg-bg-muted hover:text-fg'
				].join(' ')}
				aria-label="Page {p}"
				aria-current={p === page ? 'page' : undefined}
			>
				{p}
			</button>
		{/each}

		<button
			onclick={() => onpage?.(page + 1)}
			disabled={page >= totalPages}
			class="inline-flex h-9 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-border bg-bg text-fg hover:bg-bg-muted"
			aria-label="Next page"
		>
			Next &rsaquo;
		</button>
	</nav>
{/if}
