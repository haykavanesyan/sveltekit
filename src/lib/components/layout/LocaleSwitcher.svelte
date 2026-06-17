<script lang="ts">
	import Select from '$lib/components/primitives/Select.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getT } from '$lib/i18n/runtime.svelte';

	let { locale }: { locale: string } = $props();

	const t = getT();

	let value = $state((() => locale)());

	$effect(() => {
		value = locale;
	});

	function handleChange() {
		if (!browser || value === locale) return;
		const path = location.pathname.replace(/^\/[a-z]{2}/, `/${value}`);
		goto(path, { replaceState: true });
	}
</script>

<Select
	name="locale"
	label={t('locale.label')}
	hideLabel
	dropDownClassName="z-50"
	options={[
		{ value: 'en', label: t('locale.en') },
		{ value: 'de', label: t('locale.de') }
	]}
	bind:value
	onchange={handleChange}
	class="w-36"
/>
