<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import PostCard from '$lib/components/composites/PostCard.svelte';
	import Pagination from '$lib/components/composites/Pagination.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { createT } from '$lib/i18n/runtime';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data }: { data: { items: import('$lib/schemas/post').Post[]; page: number; totalPages: number; total: number; locale: string; tags: import('$lib/schemas/tag').Tag[] } } = $props();

	let locale = $derived($page.params.locale as 'en' | 'de');
	let t = $derived(createT(locale));

	function goToPage(p: number) {
		goto(`/${locale}/blog?page=${p}`, { replaceState: true, keepFocus: true });
	}
</script>

<SeoHead
	title={t('blog.title')}
	description="Read our latest articles."
	locale={locale}
	path="/blog"
/>

<Container size="lg" class="py-12">
	<h1 class="text-3xl font-bold text-fg">{t('blog.title')}</h1>

	{#if data.items.length === 0}
		<p class="mt-8 text-fg-muted">{t('blog.empty')}</p>
	{/if}

	<div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.items as post}
			<PostCard
				{post}
				locale={locale}
				tags={data.tags}
				readingTime={t('blog.readingTime', { minutes: post.readingTimeMinutes })}
			/>
		{/each}
	</div>

	<Pagination page={data.page} totalPages={data.totalPages} total={data.total} onpage={goToPage} />
</Container>
