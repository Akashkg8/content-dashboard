import { expect, test } from '@playwright/test';

test.describe('Search', () => {
  test('searches as you type, across sources, and updates the URL', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('/');
    const box = page.getByRole('searchbox', { name: 'Search news, movies and posts' }).first();
    await expect(box).toBeFocused();

    await box.pressSequentially('space', { delay: 40 });

    await expect(page).toHaveURL(/\/search\?q=space$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Results for “space”');
    const results = page.getByRole('list', { name: 'Search results for space' });
    await expect(results.getByRole('article').first()).toBeVisible();
    for (const source of ['News', 'Movies', 'Posts']) {
      await expect(
        page.getByRole('button', { name: new RegExp(`^${source} [1-9]`) }),
      ).toBeVisible();
    }
  });

  test('finds posts by hashtag and shows an empty state for no matches', async ({ page }) => {
    await page.goto('/search?q=%23cricket');
    await expect(page.getByRole('button', { name: /^Posts [1-9]/ })).toBeVisible();

    await page.goto('/search?q=qwertyuiop');
    await expect(page.getByText('No results for “qwertyuiop”')).toBeVisible();
    await page.getByRole('link', { name: 'Interstellar' }).click();
    await expect(page).toHaveURL(/q=Interstellar/);
    await expect(page.getByRole('heading', { name: 'Interstellar' }).first()).toBeVisible();
  });

  test('keeps the query when going back', async ({ page }) => {
    await page.goto('/search?q=markets');
    await expect(page.getByRole('searchbox').first()).toHaveValue('markets');
    await page.getByRole('link', { name: 'Trending' }).first().click();
    await page.waitForURL('**/trending');
    await page.goBack();
    await page.waitForURL('**/search?q=markets');
    await expect(page.getByRole('searchbox').first()).toHaveValue('markets');
  });
});
