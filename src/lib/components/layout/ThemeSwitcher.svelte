<script lang="ts">
	import { theme } from '$lib/stores/theme.svelte';
	import { getT } from '$lib/i18n/runtime.svelte';

	let isDark = $derived(theme.current === 'dark');
	const t = getT();
</script>

<button
	onclick={theme.toggle}
	class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-fg-muted hover:bg-bg-muted hover:text-fg"
	aria-label={isDark ? t('theme.light') : t('theme.dark')}
>
	{#if isDark}
		<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="5" />
			<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
		</svg>
	{:else}
		<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
		</svg>
	{/if}
</button>
