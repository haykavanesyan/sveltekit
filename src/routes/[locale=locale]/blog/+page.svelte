<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import PostCard from '$lib/components/composites/PostCard.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { createT } from '$lib/i18n/runtime.svelte';
	import { page } from '$app/stores';
	import type { Post } from '$lib/schemas/post';
	import type { Tag } from '$lib/schemas/tag';

	let { data }: {
		data: { items: Post[]; total: number; nextCursor: string | null; locale: string; tags: Tag[] };
	} = $props();

	let locale = $derived($page.params.locale as 'en' | 'de');
	let t = $derived(createT(locale));

	let posts = $state<Post[]>([...data.items]);
	let nextCursor = $state<string | null>(data.nextCursor);
	let loading = $state(false);

	async function loadMore() {
		if (!nextCursor || loading) return;
		loading = true;
		try {
			const res = await fetch(`/api/posts?cursor=${nextCursor}&limit=6&locale=${locale}`);
			const result = await res.json();
			posts = [...posts, ...result.posts];
			nextCursor = result.nextCursor;
		} catch {
			// silently fail — button remains for retry
		} finally {
			loading = false;
		}
	}
</script>

<SeoHead
	title={t('blog.title')}
	description={t('blog.description')}
	{locale}
	path="/blog"
/>

<Container size="lg" class="py-12">
	<h1 class="text-3xl font-bold text-fg">{t('blog.title')}</h1>

	{#if posts.length === 0}
		<p class="mt-8 text-fg-muted">{t('blog.empty')}</p>
	{/if}

	<div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each posts as post (post.id)}
			<PostCard
				{post}
				{locale}
				tags={data.tags}
				readingTime={t('blog.readingTime', { minutes: post.readingTimeMinutes })}
			/>
		{/each}
	</div>

	{#if nextCursor}
		<div class="mt-8 flex justify-center">
			<Button onclick={loadMore} loading={loading} variant="secondary" size="lg">
				{t('blog.loadMore')}
			</Button>
		</div>
	{/if}

	{#if data.total > 0}
		<p class="mt-4 text-center text-sm text-fg-muted">
			{t('blog.showingCount', { count: posts.length, total: data.total })}
		</p>
	{/if}
</Container>
