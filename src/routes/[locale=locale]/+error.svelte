<script lang="ts">
	import Container from '$lib/components/primitives/Container.svelte';
	import { page } from '$app/stores';

	let status = $derived($page.status);
	let message = $derived($page.error?.message || 'Something went wrong');
</script>

<Container size="sm" class="py-20 text-center">
	<h1 class="text-6xl font-bold text-fg">{status}</h1>
	<p class="mt-4 text-lg text-fg-muted">{message}</p>
	<a href="/" class="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-fg-inverse transition-colors hover:bg-primary/90">
		Go home
	</a>
</Container>
