<script lang="ts">
	let { title, description, locale, path, ogImage, jsonLd }: {
		title: string;
		description?: string;
		locale: string;
		path: string;
		ogImage?: string;
		jsonLd?: string;
	} = $props();

	const siteUrl = 'https://example.com';
	const enPath = path;
	const dePath = path;
</script>

<svelte:head>
	<title>{title} — Demo Co.</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	<link rel="canonical" href="{siteUrl}/{locale}{path}" />
	<link rel="alternate" hreflang="en" href="{siteUrl}/en{enPath}" />
	<link rel="alternate" hreflang="de" href="{siteUrl}/de{dePath}" />
	<link rel="alternate" hreflang="x-default" href="{siteUrl}/en{enPath}" />
	<meta property="og:title" content={title} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:url" content="{siteUrl}/{locale}{path}" />
	<meta property="og:type" content="website" />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	{#if jsonLd}
		<script type="application/ld+json">{@html jsonLd}</script>
	{/if}
</svelte:head>
