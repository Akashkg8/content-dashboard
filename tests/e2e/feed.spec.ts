import { expect, test } from '@playwright/test';

import { cards, openFeed } from './helpers';

test.describe('Personalized feed', () => {
  test('shows one interleaved feed from all sources, labelled as demo data', async ({ page }) => {
    await openFeed(page);

    const firstThree = await cards(page)
      .locator('article')
      .evaluateAll((articles) =>
        articles.slice(0, 3).map((a) => a.querySelector('span[class*="uppercase"]')?.textContent),
      );
    expect(firstThree).toEqual(['News', 'Movie', 'Post']);
    await expect(page.getByText('Demo data')).toBeVisible();
  });

  test('loads more stories when scrolled to the end', async ({ page }) => {
    await openFeed(page);
    await page.mouse.wheel(0, 20_000);
    await expect.poll(() => cards(page).count(), { timeout: 15_000 }).toBeGreaterThanOrEqual(36);
  });

  test('filters by source', async ({ page }) => {
    await openFeed(page);
    await page.getByRole('button', { name: /^Posts/ }).click();
    await expect(cards(page)).toHaveCount(9);
    await expect(cards(page).getByText('Post', { exact: true })).toHaveCount(9);
  });

  test('receives live posts over the real-time stream', async ({ page }) => {
    await openFeed(page);
    await expect(page.getByText('Live', { exact: true })).toBeVisible({ timeout: 10_000 });
    const strip = page.getByRole('region', { name: 'Just in' });
    await expect(strip.getByText('Listening for new posts…')).toBeHidden({ timeout: 15_000 });
    await expect(strip.getByRole('link', { name: /^View Post:/ }).first()).toBeVisible();
  });

  test('applies settings to the feed', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: /^Movies/ }).click();
    await page.getByRole('button', { name: /^Posts/ }).click();
    await page.getByRole('link', { name: 'My feed' }).first().click();

    await expect(cards(page)).toHaveCount(9);
    await expect(page.getByRole('button', { name: /^Movies/ })).toHaveCount(0);
  });
});
