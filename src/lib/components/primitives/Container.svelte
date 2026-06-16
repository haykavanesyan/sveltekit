<script lang="ts">
	let { size = 'lg', class: className = '', children, ...rest }: {
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		class?: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div
	class={[
		'mx-auto w-full px-4',
		size === 'sm' && 'max-w-3xl',
		size === 'md' && 'max-w-5xl',
		size === 'lg' && 'max-w-7xl',
		size === 'xl' && 'max-w-[90rem]',
		size === 'full' && 'max-w-none',
		className
	].filter(Boolean).join(' ')}
	{...rest}
>
	{@render children?.()}
</div>
