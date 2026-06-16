<script lang="ts">
	import { browser } from '$app/environment';

	let { locale }: { locale: string } = $props();

	function switchLocale(newLocale: string) {
		if (!browser) return;
		const path = location.pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
		location.href = path;
	}
</script>

<select
	value={locale}
	onchange={(e) => switchLocale((e.target as HTMLSelectElement).value)}
	class="h-8 rounded-md border border-border bg-bg px-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
	aria-label="Switch language"
>
	<option value="en">EN</option>
	<option value="de">DE</option>
</select>
