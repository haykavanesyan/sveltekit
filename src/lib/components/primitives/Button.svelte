<script lang="ts">
	let { variant = 'primary', size = 'md', disabled = false, loading = false, type = 'button', onclick, children, ...rest }: {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit';
		onclick?: (e: MouseEvent) => void;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<button
	{type}
	{disabled}
	class={[
		'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-50',
		variant === 'primary' && 'bg-primary text-fg-inverse hover:bg-primary-hover',
		variant === 'secondary' && 'border border-border bg-bg text-fg hover:bg-bg-muted',
		variant === 'ghost' && 'text-fg hover:bg-bg-muted',
		variant === 'danger' && 'bg-danger text-white hover:opacity-90',
		size === 'sm' && 'h-8 px-3 text-sm',
		size === 'md' && 'h-10 px-4 text-sm',
		size === 'lg' && 'h-12 px-6 text-base'
	].join(' ')}
	{...rest}
	{onclick}
>
	{#if loading}
		<svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
		</svg>
	{/if}
	{@render children?.()}
</button>
