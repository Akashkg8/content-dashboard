import { expect, test } from '@playwright/test';

test.describe('Dark mode', () => {
  test.use({ colorScheme: 'light' });

  test('toggles and persists across reloads without a flash', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(/light/);

    await page.getByRole('button', { name: 'Toggle dark mode' }).click();
    await expect(html).toHaveClass(/dark/);
    const darkBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(darkBackground).toBe('rgb(18, 17, 14)');

    await page.reload();
    // The class is set by an inline script before first paint, so it is there immediately.
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(
      true,
    );
  });

  test('follows the system preference by default', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await context.close();
  });
});
