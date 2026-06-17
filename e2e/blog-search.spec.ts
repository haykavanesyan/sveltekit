import { test, expect } from '@playwright/test';

test('anonymous search flow: search -> click -> post', async ({ page }) => {
	await page.goto('/en/search');
	await page.fill('input[name="q"]', 'combobox');
	await page.press('input[name="q"]', 'Enter');
	await page.waitForURL(/q=combobox/);
	const resultLink = page.locator('a[href*="/en/blog/"]').first();
	await expect(resultLink).toBeVisible();
	await resultLink.click();
	await page.waitForURL(/\/en\/blog\//);
	await expect(page.locator('h1')).toBeVisible();
});
