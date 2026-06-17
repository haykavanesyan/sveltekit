module.exports = {
	ci: {
		collect: {
			url: [
				'http://localhost:4173/en',
				'http://localhost:4173/en/blog',
				'http://localhost:4173/en/blog/sub-second-lcp-on-a-content-site',
				'http://localhost:4173/en/dashboard/campaigns'
			],
			startServerCommand: 'npm run build && npm run preview',
			numberOfRuns: 1,
			settings: {
				preset: 'desktop',
				onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices']
			}
		},
		assert: {
			assertions: {
				'categories:performance': ['warn', { minScore: 0.95 }],
				'categories:accessibility': ['error', { minScore: 0.95 }],
				'categories:seo': ['error', { minScore: 0.95 }],
				'categories:best-practices': ['error', { minScore: 0.95 }]
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
