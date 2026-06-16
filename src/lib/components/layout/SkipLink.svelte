<script lang="ts">
	let { t }: { t: (key: string) => string } = $props();
</script>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-bg focus:px-4 focus:py-2 focus:text-fg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-border-focus"
>
	{t('common.skipToContent') || 'Skip to content'}
</a>
