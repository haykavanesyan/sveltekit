<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { getT } from '$lib/i18n/runtime';
	import { formatDate } from '$lib/utils/formatters';
	import type { Post } from '$lib/schemas/post';
	import type { Tag } from '$lib/schemas/tag';

	let { data }: { data: { post: Post; locale: string; tags: Tag[] } } = $props();

	const t = getT();
	const post = data.post;
	const locale = data.locale as 'en' | 'de';
	const translation = post.translations[locale] || post.translations['en'] || { title: post.slug, excerpt: '', body: '' };

	function getTagLabel(slug: string): string {
		const tag = data.tags.find((t) => t.slug === slug);
		return tag ? tag.label[locale] : slug;
	}

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: translation.title,
		description: translation.excerpt,
		author: { '@type': 'Person', name: post.author.name },
		datePublished: post.publishedAt,
		image: `https://example.com/og/${post.slug}.png`
	});

	const breadcrumbLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: `https://example.com/${locale}` },
			{ '@type': 'ListItem', position: 2, name: 'Blog', item: `https://example.com/${locale}/blog` },
			{ '@type': 'ListItem', position: 3, name: translation.title }
		]
	});
</script>

<SeoHead
	title={translation.title}
	description={translation.excerpt}
	locale={locale}
	path="/blog/{post.slug}"
	ogImage="https://example.com/og/{post.slug}.png"
	jsonLd={jsonLd + '\n' + breadcrumbLd}
/>

<Container size="sm" class="py-12">
	<div class="flex flex-wrap gap-2">
		{#each post.tags as tag}
			<Badge variant="info">{getTagLabel(tag)}</Badge>
		{/each}
	</div>

	<h1 class="mt-4 text-4xl font-bold text-fg">{translation.title}</h1>

	<div class="mt-4 flex items-center gap-3 text-sm text-fg-muted">
		<div
			class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
			style="background-color: {post.author.avatarColor}"
		>
			{post.author.name.split(' ').map(n => n[0]).join('')}
		</div>
		<span>{post.author.name}</span>
		<span>·</span>
		<span>{formatDate(post.publishedAt, locale)}</span>
		<span>·</span>
		<span>{t('blog.readingTime').replace('{minutes}', String(post.readingTimeMinutes))}</span>
	</div>

	<article class="prose prose-gray mt-8 max-w-none dark:prose-invert">
		{translation.body}
	</article>
</Container>
