function createToastStore() {
	const messages = $state<{ id: string; text: string; type: 'success' | 'error' | 'info' }[]>([]);

	function add(text: string, type: 'success' | 'error' | 'info' = 'info') {
		const id = crypto.randomUUID();
		messages.push({ id, text, type });
		setTimeout(() => {
			const idx = messages.findIndex((m) => m.id === id);
			if (idx !== -1) messages.splice(idx, 1);
		}, 5000);
	}

	function dismiss(id: string) {
		const idx = messages.findIndex((m) => m.id === id);
		if (idx !== -1) messages.splice(idx, 1);
	}

	return {
		get messages() { return messages; },
		add,
		dismiss
	};
}

export const toast = createToastStore();
