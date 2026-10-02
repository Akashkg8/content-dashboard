import { expect, test } from '@playwright/test';

test.describe('Mobile layout', () => {
  test.skip(({ isMobile }) => !isMobile, 'Phone-sized viewport only');

  test('navigates with the drawer, which traps focus and closes on Escape', async ({ page }) => {
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: 'Open menu' });
    await menuButton.click();

    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer).toBeVisible();
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(
      true,
    );

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(menuButton).toBeFocused();

    await menuButton.click();
    await drawer.getByRole('link', { name: 'Trending' }).click();
    await expect(page).toHaveURL('/trending');
    await expect(drawer).toBeHidden();
  });

  test('has no horizontal scroll and offers search on the search page', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    await page.getByRole('link', { name: 'Search' }).click();
    const box = page.getByRole('searchbox').last();
    await box.fill('cricket');
    await expect(page).toHaveURL(/q=cricket/);
  });
});
