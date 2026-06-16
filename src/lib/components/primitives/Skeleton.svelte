<script lang="ts">
	let { width = '100%', height = '1rem', rounded = 'md', class: className = '' }: {
		width?: string;
		height?: string;
		rounded?: 'sm' | 'md' | 'lg' | 'full';
		class?: string;
	} = $props();
</script>

<div
	class={[
		'animate-pulse bg-bg-muted',
		rounded === 'sm' && 'rounded-sm',
		rounded === 'md' && 'rounded-md',
		rounded === 'lg' && 'rounded-lg',
		rounded === 'full' && 'rounded-full',
		className
	].join(' ')}
	style="width: {width}; height: {height}"
	aria-hidden="true"
></div>
