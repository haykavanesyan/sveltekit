<script lang="ts">
	let { messages = [] }: {
		messages?: { id: string; text: string; type: 'success' | 'error' | 'info' }[];
	} = $props();

	function dismiss(id: string) {
		const idx = messages.findIndex((m) => m.id === id);
		if (idx !== -1) messages.splice(idx, 1);
	}
</script>

{#if messages.length > 0}
	<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
		{#each messages as msg (msg.id)}
			<div
				role="alert"
				class={[
					'flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg transition-all',
					msg.type === 'success' && 'bg-success text-white',
					msg.type === 'error' && 'bg-danger text-white',
					msg.type === 'info' && 'bg-primary text-fg-inverse'
				].join(' ')}
			>
				<span class="flex-1">{msg.text}</span>
				<button onclick={() => dismiss(msg.id)} class="cursor-pointer text-current opacity-70 hover:opacity-100">&times;</button>
			</div>
		{/each}
	</div>
{/if}
