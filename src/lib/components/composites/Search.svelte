<script lang="ts">
	import Input from '$lib/components/primitives/Input.svelte';

	let { value = $bindable(), placeholder, onsearch }: {
		value?: string | undefined;
		placeholder?: string;
		onsearch?: (value: string | undefined) => void;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			onsearch?.(value);
		}
	}
</script>

<div class="flex gap-2">
	<div class="flex-1">
		<Input
			name="q"
			{placeholder}
			bind:value={value}
			onkeydown={handleKeydown}
		/>
	</div>
	<button
		onclick={() => onsearch?.(value)}
		class="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-fg-inverse transition-colors hover:bg-primary/90"
	>
		Search
	</button>
</div>
