<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
</script>

<svelte:head>
	<title>404 — Page not found</title>
	<meta name="description" content="The page you're looking for doesn't exist." />
	<meta name="robots" content="noindex" />
</svelte:head>

<Container size="sm" class="py-20 text-center">
	<h1 class="text-7xl font-bold text-fg">404</h1>
	<p class="mt-4 text-xl text-fg-muted">Page not found</p>
	<p class="mt-2 text-fg-muted">The page you're looking for doesn't exist or has been moved.</p>
	<a
		href="/"
		class="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-fg-inverse transition-colors hover:bg-primary/90"
	>
		Go home
	</a>
</Container>
