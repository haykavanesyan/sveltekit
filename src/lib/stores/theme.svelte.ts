import { browser } from '$app/environment';

function createTheme() {
	let current = $state<'light' | 'dark'>('light');

	function apply(theme: 'light' | 'dark') {
		current = theme;
		if (browser) {
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('theme', theme);
		}
	}

	function init() {
		if (!browser) return;
		const saved = localStorage.getItem('theme');
		if (saved === 'dark' || saved === 'light') {
			apply(saved);
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			apply(prefersDark ? 'dark' : 'light');
		}
	}

	function toggle() {
		apply(current === 'light' ? 'dark' : 'light');
	}

	return {
		get current() { return current; },
		init,
		toggle
	};
}

export const theme = createTheme();
