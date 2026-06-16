<script lang="ts">
	import Select from '$lib/components/primitives/Select.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let { locale }: { locale: string } = $props();

	let value = $state(locale);

	function handleChange() {
		if (!browser || value === locale) return;
		const path = location.pathname.replace(/^\/[a-z]{2}/, `/${value}`);
		goto(path, { replaceState: true });
	}
</script>

<Select
	name="locale"
	dropDownClassName="z-50"
	options={[
		{ value: 'en', label: 'English' },
		{ value: 'de', label: 'Deutsch' }
	]}
	bind:value
	onchange={handleChange}
	class="w-36"
/>
