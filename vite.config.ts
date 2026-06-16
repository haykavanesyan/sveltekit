import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	resolve: {
		alias: {
			$mocks: '/mocks'
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
