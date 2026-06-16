<script lang="ts">
	import { focusTrap } from '$lib/actions/focusTrap';

	let { open = false, onclose, title, children }: {
		open?: boolean;
		onclose?: () => void;
		title?: string;
		children?: import('svelte').Snippet;
	} = $props();

	let dialogEl: HTMLDivElement | undefined = $state();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && onclose) {
			onclose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl && onclose) {
			onclose();
		}
	}

	let bodyOverflow = $state('');
	$effect(() => {
		if (open) {
			bodyOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = bodyOverflow;
		}
		return () => {
			document.body.style.overflow = bodyOverflow;
		};
	});

	const titleId = 'dialog-title';
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby={titleId}
		tabindex="-1"
		onkeydown={handleKeydown}
		onclick={handleBackdropClick}
		bind:this={dialogEl}
	>
		<div
			class="w-full max-w-md rounded-lg border border-border bg-bg shadow-xl"
			use:focusTrap={open}
			role="document"
		>
			<div class="flex items-center justify-between border-b border-border px-6 py-4">
				<h2 id={titleId} class="text-lg font-semibold text-fg">{title || 'Dialog'}</h2>
				<button
					onclick={onclose}
					class="cursor-pointer rounded-md p-1 text-fg-muted hover:bg-bg-muted hover:text-fg"
					aria-label="Close dialog"
				>
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
			<div class="px-6 py-4">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
