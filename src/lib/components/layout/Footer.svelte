<script lang="ts">
	let { t }: { t: (key: string) => string } = $props();
</script>

<footer class="border-t border-border bg-bg-muted">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-8">
		<p class="text-sm text-fg-muted">{t('footer.copy')}</p>
	</div>
</footer>
