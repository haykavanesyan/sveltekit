import { test, expect } from '@playwright/test';
import { chromium } from '@playwright/test';

test('dashboard inline edit optimistically updates budget', async ({ page }) => {
	await page.goto('/en/login');
	await page.fill('input[name="email"]', 'admin@demo.test');
	await page.fill('input[name="password"]', 'password');
	await page.click('button[type="submit"]');
	await page.waitForURL(/\/en\/dashboard/);

	// Navigate to items
	await page.goto('/en/dashboard/items');

	// Click the first editable budget button
	const budgetBtn = page.locator('[data-editable="true"]').first();
	await budgetBtn.click();

	// Input should now be visible
	const input = page.locator('input[aria-label*="Edit budget"]');
	await expect(input).toBeVisible();

	// Change value and save
	await input.fill('50000');
	await input.press('Enter');

	// Optimistic UI should show the new value
	await expect(budgetBtn).toContainText('$50,000');
});

test('accessibility check on search page', async ({ page }) => {
	const AxeBuilder = require('@axe-core/playwright').default;
	await page.goto('/en/search');
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
});

test('visual snapshot of landing page', async ({ page }) => {
	await page.goto('/en');
	await expect(page).toHaveScreenshot('landing.png', { fullPage: true });
});
