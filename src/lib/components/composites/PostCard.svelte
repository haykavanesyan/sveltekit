<script lang="ts">
	import Card from '$lib/components/primitives/Card.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import { formatDate } from '$lib/utils/formatters';
	import type { Post } from '$lib/schemas/post';
	import type { Tag } from '$lib/schemas/tag';

	let { post, locale, tags, readingTime }: {
		post: Post;
		locale: string;
		tags: Tag[];
		readingTime?: string;
	} = $props();

	function getTagLabel(slug: string): string {
		const tag = tags.find((t) => t.slug === slug);
		return tag ? (tag.label as Record<string, string>)[locale] || slug : slug;
	}
</script>

<a href="/{locale}/blog/{post.slug}" class="block transition-opacity hover:opacity-90">
	<Card padding="none" class="h-full overflow-hidden">
		<div class="h-20" style="background-color: {post.coverColor}"></div>
		<div class="p-4">
			<div class="flex flex-wrap gap-2">
				{#each post.tags as tag (tag)}
					<Badge variant="default">{getTagLabel(tag)}</Badge>
				{/each}
			</div>
			<h2 class="mt-3 text-lg font-semibold text-fg">{post.translations[locale as 'en' | 'de']?.title}</h2>
			<p class="mt-2 text-sm text-fg-muted line-clamp-2">{post.translations[locale as 'en' | 'de']?.excerpt}</p>
			<div class="mt-4 flex items-center gap-2 text-xs text-fg-muted">
				<div
					class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
					style="background-color: {post.author.avatarColor}"
				>{post.author.name[0]}</div>
				<span>{post.author.name}</span>
				<span>·</span>
				<span>{formatDate(post.publishedAt, locale)}</span>
				{#if readingTime}
					<span>·</span>
					<span>{readingTime}</span>
				{/if}
			</div>
		</div>
	</Card>
</a>