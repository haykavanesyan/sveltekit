<script lang="ts">
	let { padding = 'md', shadow = true, children, ...rest }: {
		padding?: 'none' | 'sm' | 'md' | 'lg';
		shadow?: boolean;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div
	class={[
		'rounded-lg border border-border bg-bg',
		shadow && 'shadow-sm',
		padding === 'none' && 'p-0',
		padding === 'sm' && 'p-3',
		padding === 'md' && 'p-4',
		padding === 'lg' && 'p-6'
	].join(' ')}
	{...rest}
>
	{@render children?.()}
</div>
