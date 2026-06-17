<script lang="ts">
	import '../app.css';
	import ErrorBoundary from '$lib/components/composites/ErrorBoundary.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		theme.init();
	});
</script>

<ErrorBoundary>
	{@render children()}
</ErrorBoundary>
