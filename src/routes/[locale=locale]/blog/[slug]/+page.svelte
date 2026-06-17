<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { createT } from '$lib/i18n/runtime';
	import { formatDate } from '$lib/utils/formatters';
	import type { Post } from '$lib/schemas/post';
	import type { Tag } from '$lib/schemas/tag';
	import { page } from '$app/stores';

	let { data }: { data: { post: Post; locale: string; tags: Tag[] } } = $props();

	let locale = $derived($page.params.locale as 'en' | 'de');
	let t = $derived(createT(locale));
	let translation = $derived(
		data.post.translations[locale] || data.post.translations['en'] || { title: data.post.slug, excerpt: '', body: '' }
	);

	function getTagLabel(slug: string): string {
		const tag = data.tags.find((t) => t.slug === slug);
		return tag ? tag.label[locale] : slug;
	}

	let jsonLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: translation.title,
		description: translation.excerpt,
		author: { '@type': 'Person', name: data.post.author.name },
		datePublished: data.post.publishedAt,
		image: `https://example.com/og/${data.post.slug}`
	}));

	let breadcrumbLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: `https://example.com/${locale}` },
			{ '@type': 'ListItem', position: 2, name: 'Blog', item: `https://example.com/${locale}/blog` },
			{ '@type': 'ListItem', position: 3, name: translation.title }
		]
	}));
</script>

<SeoHead
	title={translation.title}
	description={translation.excerpt}
	{locale}
	path="/blog/{data.post.slug}"
	ogImage="https://example.com/og/{data.post.slug}"
	jsonLd={jsonLd + '\n' + breadcrumbLd}
/>

<Container size="sm" class="py-12">
	<div class="flex flex-wrap gap-2">
		{#each data.post.tags as tag}
			<Badge variant="info">{getTagLabel(tag)}</Badge>
		{/each}
	</div>

	<h1 class="mt-4 text-4xl font-bold text-fg">{translation.title}</h1>

	<div class="mt-4 flex items-center gap-3 text-sm text-fg-muted">
		<div
			class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
			style="background-color: {data.post.author.avatarColor}"
		>
			{data.post.author.name.split(' ').map(n => n[0]).join('')}
		</div>
		<span>{data.post.author.name}</span>
		<span>·</span>
		<span>{formatDate(data.post.publishedAt, locale)}</span>
		<span>·</span>
		<span>{t('blog.readingTime', { minutes: data.post.readingTimeMinutes })}</span>
	</div>

	<article class="prose prose-gray mt-8 max-w-none dark:prose-invert">
		{translation.body}
	</article>
</Container>
