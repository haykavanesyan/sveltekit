<script lang="ts">
	import LocaleSwitcher from './LocaleSwitcher.svelte';

	let { t, locale }: { t: (key: string) => string; locale: string } = $props();
</script>

<footer class="border-t border-border bg-bg-muted">
	<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-8 sm:flex-row">
		<p class="text-sm text-fg-muted">{t('footer.copy')}</p>
		<div class="md:hidden">
			<LocaleSwitcher {locale} />
		</div>
	</div>
</footer>
