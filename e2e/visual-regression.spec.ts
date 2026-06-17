import { test, expect } from '@playwright/test';

test('landing page matches visual snapshot', async ({ page }) => {
	await page.goto('/en');
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveScreenshot('landing-page.png', {
		fullPage: true,
		maxDiffPixelRatio: 0.02
	});
});
