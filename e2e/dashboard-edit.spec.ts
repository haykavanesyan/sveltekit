import { test, expect } from '@playwright/test';

test('optimistic update with rollback on failure', async ({ page }) => {
	await page.goto('/en/login');
	await page.fill('input[name="email"]', 'admin@demo.test');
	await page.fill('input[name="password"]', 'demo1234');
	await page.click('button[type="submit"]');
	await page.waitForURL(/\/en\/dashboard/);

	await page.goto('/en/dashboard/campaigns');

	const budgetCell = page.locator('[data-editable="true"]').first();
	await budgetCell.click();

	const input = page.locator('input[aria-label*="Edit budget"]');
	await expect(input).toBeVisible();

	const prevValue = await budgetCell.textContent();

	await input.fill('50000');
	await input.press('Enter');
	await expect(budgetCell).not.toHaveText(prevValue || '');

	await budgetCell.click();
	await expect(input).toBeVisible();

	await page.route(
		(url) => url.pathname.startsWith('/api/'),
		(route) => route.fulfill({ status: 500 })
	);

	await input.fill('99999');
	await input.press('Enter');
	await expect(budgetCell).toHaveText(/\$50,000/);
});
