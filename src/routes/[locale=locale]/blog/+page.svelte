<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { getT } from '$lib/i18n/runtime';
	import { formatDate } from '$lib/utils/formatters';
	import { page } from '$app/stores';
	import type { Post } from '$lib/schemas/post';
	import type { Tag } from '$lib/schemas/tag';

	let { data }: { data: { posts: Post[]; nextCursor: string | null; total: number; locale: string; tags: Tag[] } } = $props();

	const t = getT();
	let posts = $state(data.posts);
	let cursor = $state(data.nextCursor);
	let loading = $state(false);

	async function loadMore() {
		if (!cursor || loading) return;
		loading = true;
		const res = await fetch(`/api/posts?cursor=${cursor}`);
		const json = await res.json();
		posts = [...posts, ...json.posts];
		cursor = json.nextCursor;
		loading = false;
	}

	function getTagLabel(slug: string): string {
		const tag = data.tags.find((t) => t.slug === slug);
		return tag ? tag.label[data.locale] : slug;
	}
</script>

<SeoHead
	title={t('blog.title')}
	description="Read our latest articles."
	locale={data.locale}
	path="/blog"
/>

<Container size="lg" class="py-12">
	<h1 class="text-3xl font-bold text-fg">{t('blog.title')}</h1>

	{#if posts.length === 0}
		<p class="mt-8 text-fg-muted">{t('blog.empty')}</p>
	{/if}

	<div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each posts as post}
			<a href="/{data.locale}/blog/{post.slug}" class="block transition-opacity hover:opacity-90">
				<Card padding="none" class="h-full overflow-hidden">
					<div class="h-40" style="background-color: {post.coverColor}"></div>
					<div class="p-4">
						<div class="flex flex-wrap gap-2">
							{#each post.tags as tag}
								<Badge variant="default">{getTagLabel(tag)}</Badge>
							{/each}
						</div>
						<h2 class="mt-3 text-lg font-semibold text-fg">{post.translations[data.locale as 'en' | 'de']?.title}</h2>
						<p class="mt-2 text-sm text-fg-muted line-clamp-2">{post.translations[data.locale as 'en' | 'de']?.excerpt}</p>
						<div class="mt-4 flex items-center gap-2 text-xs text-fg-muted">
							<span>{post.author.name}</span>
							<span>·</span>
							<span>{formatDate(post.publishedAt, data.locale)}</span>
							<span>·</span>
							<span>{t('blog.readingTime').replace('{minutes}', String(post.readingTimeMinutes))}</span>
						</div>
					</div>
				</Card>
			</a>
		{/each}
	</div>

	{#if cursor}
		<div class="mt-8 text-center">
			<Button onclick={loadMore} loading={loading}>
				{t('blog.readMore')}
			</Button>
		</div>
	{/if}
</Container>
