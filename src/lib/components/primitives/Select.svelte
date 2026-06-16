<script lang="ts">
	let { label, value = $bindable(''), options, name, id, class: className = '', onchange, placeholder, ...rest }: {
		label?: string;
		value?: string;
		options: { value: string; label: string }[];
		name?: string;
		id?: string;
		class?: string;
		onchange?: (e: Event) => void;
		placeholder?: string;
	} = $props();

	const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
</script>

<div class={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
	{#if label}
		<label for={selectId} class="text-sm font-medium text-fg">{label}</label>
	{/if}
	<select
		{name}
		bind:value
		id={selectId}
		class="h-10 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
		{...rest}
		{onchange}
	>
		{#if placeholder}
			<option value="">{placeholder}</option>
		{/if}
		{#each options as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>
