import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('dashboard campaigns page has no serious or critical a11y violations', async ({ page }) => {
	await page.goto('/en/login');
	await page.fill('input[name="email"]', 'admin@demo.test');
	await page.fill('input[name="password"]', 'demo1234');
	await page.click('button[type="submit"]');
	await page.waitForURL(/\/en\/dashboard/);

	await page.goto('/en/dashboard/campaigns');
	await page.waitForSelector('table');

	const results = await new AxeBuilder({ page }).analyze();
	const violations = results.violations.filter(
		(v) => v.impact === 'serious' || v.impact === 'critical'
	);
	expect(violations).toHaveLength(0);
});

test('landing page has no serious or critical a11y violations', async ({ page }) => {
	await page.goto('/en');
	const results = await new AxeBuilder({ page }).analyze();
	const violations = results.violations.filter(
		(v) => v.impact === 'serious' || v.impact === 'critical'
	);
	expect(violations).toHaveLength(0);
});
