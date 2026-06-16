<script lang="ts">
	let { variant = 'default', children, ...rest }: {
		variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
		children?: import('svelte').Snippet;
	} = $props();
</script>

<span
	class={[
		'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
		variant === 'default' && 'bg-bg-muted text-fg-muted',
		variant === 'success' && 'bg-success/10 text-success',
		variant === 'warning' && 'bg-warning/10 text-warning',
		variant === 'danger' && 'bg-danger/10 text-danger',
		variant === 'info' && 'bg-primary/10 text-primary'
	].join(' ')}
	{...rest}
>
	{@render children?.()}
</span>
