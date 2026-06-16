<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Card from '$lib/components/primitives/Card.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import Pagination from '$lib/components/composites/Pagination.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { getT } from '$lib/i18n/runtime';
	import { formatDate } from '$lib/utils/formatters';
	import { goto } from '$app/navigation';
	import type { Post } from '$lib/schemas/post';
	import type { Tag } from '$lib/schemas/tag';

	let { data }: { data: { items: Post[]; page: number; totalPages: number; total: number; locale: string; tags: Tag[] } } = $props();

	const t = getT();

	function goToPage(p: number) {
		goto(`/${data.locale}/blog?page=${p}`, { replaceState: true, keepFocus: true });
	}

	function getTagLabel(slug: string): string {
		const tag = data.tags.find((t) => t.slug === slug);
		return tag ? tag.label[data.locale as 'en' | 'de'] : slug;
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

	{#if data.items.length === 0}
		<p class="mt-8 text-fg-muted">{t('blog.empty')}</p>
	{/if}

	<div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.items as post}
			<a href="/{data.locale}/blog/{post.slug}" class="block transition-opacity hover:opacity-90">
				<Card padding="none" class="h-full overflow-hidden">
					<div class="h-20" style="background-color: {post.coverColor}"></div>
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

	<Pagination page={data.page} totalPages={data.totalPages} total={data.total} onpage={goToPage} />
</Container>
