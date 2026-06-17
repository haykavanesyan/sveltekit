<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import SkipLink from '$lib/components/layout/SkipLink.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import Toast from '$lib/components/primitives/Toast.svelte';
	import { setLocaleContext, createT } from '$lib/i18n/runtime';
	import { onMount } from 'svelte';
	import { initWebVitals } from '$lib/utils/web-vitals';
	import { initErrorReporting } from '$lib/utils/error-reporting';
	import { page } from '$app/stores';

	let { data, children }: {
		data: { locale: 'en' | 'de'; user?: { name: string; role: string } | null };
		children?: import('svelte').Snippet;
	} = $props();

	setLocaleContext(data.locale);
	let t = $derived(createT(data.locale));

	let user = $derived(data.user);

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.lang = data.locale;
		}
	});

	onMount(() => {
		initWebVitals(0.1);
		initErrorReporting();
	});
</script>

<div class="flex min-h-svh flex-col">
	<SkipLink {t} />
	<SeoHead
		title="Demo Co."
		description="A performance-first stack for teams that ship."
		locale={data.locale}
		path={$page.url.pathname.replace(/^\/(en|de)/, '') || '/'}
	/>
	<Header locale={data.locale} {t} {user} />
	<main id="main-content" class="flex-1">
		{@render children?.()}
	</main>
	<Footer {t} locale={data.locale} />
	<Toast messages={[]} />
</div>
