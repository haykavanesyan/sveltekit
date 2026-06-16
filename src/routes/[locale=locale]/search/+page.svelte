<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Select from '$lib/components/primitives/Select.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { getT } from '$lib/i18n/runtime';
	import { formatDate } from '$lib/utils/formatters';
	import { goto } from '$app/navigation';
	import type { Post } from '$lib/schemas/post';
	import type { Tag } from '$lib/schemas/tag';

	let { data }: { data: { posts: Post[]; query: string; activeTag: string; sort: string; nextCursor: string | null; locale: string; tags: Tag[] } } = $props();

	const t = getT();
	const locale = data.locale as 'en' | 'de';

	let query = $state(data.query);
	let activeTag = $state(data.activeTag);
	let sort = $state(data.sort);

	function updateUrl() {
		const sp = new URLSearchParams();
		if (query) sp.set('q', query);
		if (activeTag) sp.set('tag', activeTag);
		if (sort && sort !== 'date') sp.set('sort', sort);
		goto(`/${locale}/search?${sp}`, { replaceState: true, keepFocus: true });
	}

	function getTagLabel(slug: string): string {
		const tag = data.tags.find((t) => t.slug === slug);
		return tag ? tag.label[locale] : slug;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') updateUrl();
	}
</script>

<SeoHead
	title={t('search.results').replace('{count}', String(data.posts.length)).replace('{query}', query || '...')}
	description="Search blog posts"
	locale={locale}
	path="/search"
/>

<Container size="lg" class="py-12">
	<h1 class="text-3xl font-bold text-fg">{t('nav.search')}</h1>

	<div class="mt-6 flex flex-col gap-4 sm:flex-row">
		<div class="flex-1">
			<Input
				name="q"
				placeholder={t('search.placeholder')}
				bind:value={query}
				onkeydown={handleKeydown}
			/>
		</div>
		<button onclick={updateUrl} class="rounded-md bg-primary px-4 text-sm font-medium text-fg-inverse transition-colors hover:bg-primary/90">
			Search
		</button>
		<Select
			name="tag"
			options={[{ value: '', label: 'All tags' }, ...data.tags.map(t => ({ value: t.slug, label: getTagLabel(t.slug) }))]}
			bind:value={activeTag}
			onchange={updateUrl}
		/>
		<Select
			name="sort"
			options={[
				{ value: 'date', label: 'Newest first' },
				{ value: 'date_asc', label: 'Oldest first' }
			]}
			bind:value={sort}
			onchange={updateUrl}
		/>
	</div>

	{#if query}
		<p class="mt-4 text-sm text-fg-muted">
			{t('search.results').replace('{count}', String(data.posts.length)).replace('{query}', query)}
		</p>
	{/if}

	{#if data.posts.length === 0}
		<p class="mt-8 text-fg-muted">{t('search.noResults')}</p>
	{/if}

	<div class="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.posts as post}
			<a href="/{locale}/blog/{post.slug}" class="block transition-opacity hover:opacity-90">
				<Card padding="none" class="h-full overflow-hidden">
					<div class="h-20" style="background-color: {post.coverColor}"></div>
					<div class="p-4">
						<div class="flex flex-wrap gap-2">
							{#each post.tags as tag}
								<Badge variant="default">{getTagLabel(tag)}</Badge>
							{/each}
						</div>
						<h2 class="mt-3 text-lg font-semibold text-fg">{post.translations[locale]?.title}</h2>
						<p class="mt-2 text-sm text-fg-muted line-clamp-2">{post.translations[locale]?.excerpt}</p>
						<div class="mt-4 flex items-center gap-2 text-xs text-fg-muted">
							<span>{post.author.name}</span>
							<span>·</span>
							<span>{formatDate(post.publishedAt, locale)}</span>
						</div>
					</div>
				</Card>
			</a>
		{/each}
	</div>
</Container>
