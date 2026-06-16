<script lang="ts">
	let { level = 1, size, children, ...rest }: {
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
		children?: import('svelte').Snippet;
	} = $props();

	const tag = 'h' + level;

	const sizes: Record<string, string> = {
		xs: 'text-xs',
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg',
		xl: 'text-xl',
		'2xl': 'text-2xl',
		'3xl': 'text-3xl'
	};
</script>

<svelte:element
	this={tag}
	class={[
		'font-semibold text-fg',
		size ? sizes[size] : level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : level === 3 ? 'text-xl' : level === 4 ? 'text-lg' : 'text-base'
	].join(' ')}
	{...rest}
>
	{@render children?.()}
</svelte:element>
