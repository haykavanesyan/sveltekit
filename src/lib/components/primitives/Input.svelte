<script lang="ts">
	let { label, error, value = $bindable(), placeholder = '', type = 'text', name, id, class: className = '', oninput, onblur, onkeydown, ...rest }: {
		label?: string;
		error?: string;
		value?: string | number | null | undefined;
		placeholder?: string;
		type?: string;
		name?: string;
		id?: string;
		class?: string;
		oninput?: (e: Event) => void;
		onblur?: (e: FocusEvent) => void;
		onkeydown?: (e: KeyboardEvent) => void;
	} = $props();

	let inputId = $derived(id || name || label?.toLowerCase().replace(/\s+/g, '-'));
	let errorId = $derived(inputId + '-error');
</script>

<div class={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
	{#if label}
		<label for={inputId} class="text-sm font-medium text-fg">{label}</label>
	{/if}
	<input
		{type}
		{name}
		{placeholder}
		bind:value
		id={inputId}
		aria-invalid={!!error}
		aria-describedby={error ? errorId : undefined}
		class={[
			'h-10 w-full rounded-md border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted transition-colors',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
			error ? 'border-danger' : 'border-border'
		].join(' ')}
		{...rest}
		{oninput}
		{onblur}
		{onkeydown}
	/>
	{#if error}
		<p id={errorId} class="text-sm text-danger" role="alert">{error}</p>
	{/if}
</div>
