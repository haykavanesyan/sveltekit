<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import SkipLink from '$lib/components/layout/SkipLink.svelte';
	import ErrorBoundary from '$lib/components/composites/ErrorBoundary.svelte';
	import Toast from '$lib/components/primitives/Toast.svelte';
	import { setLocaleContext } from '$lib/i18n/runtime.svelte';
	import { onMount } from 'svelte';
	import { initWebVitals } from '$lib/utils/web-vitals';
	import { initErrorReporting } from '$lib/utils/error-reporting';

	let { data, children }: {
		data: { locale: 'en' | 'de'; user?: { name: string; role: string } | null };
		children?: import('svelte').Snippet;
	} = $props();

	const i18n = setLocaleContext((() => data.locale)());

	$effect(() => {
		i18n.locale = data.locale;
	});

	let t = $derived(i18n.t);

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
	<Header locale={data.locale} {user} />
	<main id="main-content" class="flex-1">
		<ErrorBoundary>
			{@render children?.()}
		</ErrorBoundary>
	</main>
	<Footer {t} locale={data.locale} />
	<Toast />
</div>
