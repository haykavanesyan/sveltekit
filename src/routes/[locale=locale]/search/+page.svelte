<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import PostCard from '$lib/components/composites/PostCard.svelte';
	import Search from '$lib/components/composites/Search.svelte';
	import Select from '$lib/components/primitives/Select.svelte';
	import Pagination from '$lib/components/composites/Pagination.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { createT } from '$lib/i18n/runtime';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data }: { data: { items: import('$lib/schemas/post').Post[]; page: number; totalPages: number; total: number; query: string; activeTag: string; sort: string; locale: string; tags: import('$lib/schemas/tag').Tag[] } } = $props();

	let locale = $derived($page.params.locale as 'en' | 'de');
	let t = $derived(createT(locale));

	let query = $state(data.query);
	let activeTag = $state(data.activeTag);
	let sort = $state(data.sort);

	function updateUrl(resetPage = true) {
		const sp = new URLSearchParams();
		if (query) sp.set('q', query);
		if (activeTag) sp.set('tag', activeTag);
		if (sort && sort !== 'date') sp.set('sort', sort);
		if (!resetPage && data.page > 1) sp.set('page', String(data.page));
		goto(`/${locale}/search?${sp}`, { replaceState: true, keepFocus: true });
	}

	function goToPage(p: number) {
		const sp = new URLSearchParams(location.search);
		if (query) sp.set('q', query);
		if (activeTag) sp.set('tag', activeTag);
		if (sort && sort !== 'date') sp.set('sort', sort);
		if (p > 1) sp.set('page', String(p));
		else sp.delete('page');
		goto(`/${locale}/search?${sp}`, { replaceState: true, keepFocus: true });
	}
</script>

<SeoHead
	title={t('search.results').replace('{count}', String(data.total)).replace('{query}', query || '...')}
	description="Search blog posts"
	locale={locale}
	path="/search"
/>

<Container size="lg" class="py-12">
	<h1 class="text-3xl font-bold text-fg">{t('nav.search')}</h1>

	<div class="mt-6 flex flex-col gap-4 sm:flex-row">
		<div class="flex-1">
			<Search
				placeholder={t('search.placeholder')}
				bind:value={query}
				onsearch={() => updateUrl(true)}
			/>
		</div>
		<Select
			name="tag"
			options={[{ value: '', label: 'All tags' }, ...data.tags.map(t => ({ value: t.slug, label: (t.label as Record<string, string>)[locale] || t.slug }))]}
			bind:value={activeTag}
			onchange={() => updateUrl(true)}
		/>
		<Select
			name="sort"
			options={[
				{ value: 'date', label: 'Newest first' },
				{ value: 'date_asc', label: 'Oldest first' }
			]}
			bind:value={sort}
			onchange={() => updateUrl(true)}
		/>
	</div>

	{#if query}
		<p class="mt-4 text-sm text-fg-muted">
			{t('search.results').replace('{count}', String(data.total)).replace('{query}', query)}
		</p>
	{/if}

	{#if data.items.length === 0}
		<p class="mt-8 text-fg-muted">{t('search.noResults')}</p>
	{/if}

	<div class="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.items as post}
			<PostCard {post} locale={locale} tags={data.tags} />
		{/each}
	</div>

	<Pagination page={data.page} totalPages={data.totalPages} total={data.total} onpage={goToPage} />
</Container>
