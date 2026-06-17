<script lang="ts">
	import '../app.css';
	import ErrorBoundary from '$lib/components/composites/ErrorBoundary.svelte';

	let { children } = $props();
</script>

<ErrorBoundary>
	{@render children()}
</ErrorBoundary>
