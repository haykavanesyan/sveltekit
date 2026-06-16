import { test, expect } from '@playwright/test';

test('blog search finds posts by query', async ({ page }) => {
	await page.goto('/en/search');
	await page.fill('input[name="q"]', 'post');
	await page.waitForTimeout(500);
	const cards = page.locator('a[href*="/en/blog/"]');
	await expect(cards.first()).toBeVisible();
});

test('search shows no results for gibberish', async ({ page }) => {
	await page.goto('/en/search?q=xyznonexistent999');
	await expect(page.getByText(/no results/i)).toBeVisible();
});
