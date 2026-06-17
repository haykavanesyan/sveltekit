import { test, expect } from '@playwright/test';

test('dashboard inline edit optimistically updates budget', async ({ page }) => {
	await page.goto('/en/login');
	await page.fill('input[name="email"]', 'admin@demo.test');
	await page.fill('input[name="password"]', 'demo1234');
	await page.click('button[type="submit"]');
	await page.waitForURL(/\/en\/dashboard/);

	await page.goto('/en/dashboard/campaigns');

	const budgetBtn = page.locator('[data-editable="true"]').first();
	await budgetBtn.click();

	const input = page.locator('input[aria-label*="Edit budget"]');
	await expect(input).toBeVisible();

	const prevValue = await budgetBtn.textContent();
	await input.fill('50000');
	await input.press('Enter');

	await expect(budgetBtn).not.toHaveText(prevValue || '');
});
