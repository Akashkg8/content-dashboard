import { expect, test } from '@playwright/test';

import { cards, cardTitles, openFeed, waitForSave } from './helpers';

test.describe('Favorites', () => {
  test('saves a card, counts it in the sidebar and keeps it after reload', async ({ page }) => {
    await openFeed(page);
    const [title] = await cardTitles(page);
    const heart = cards(page)
      .first()
      .getByRole('button', { name: /^Favorite:/ });

    await heart.click();
    await expect(heart).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: /^Favorites\s?1 saved$/ }).first()).toBeVisible();
    await waitForSave(
      page,
      (saved) => ((saved.favorites as { ids?: string[] })?.ids?.length ?? 0) === 1,
    );

    await page.reload();
    await page
      .getByRole('link', { name: /^Favorites\s?1 saved$/ })
      .first()
      .click();
    await expect(page).toHaveURL('/favorites');
    await expect(cards(page)).toHaveCount(1);
    await expect(page.getByRole('heading', { name: title! })).toBeVisible();

    await cards(page)
      .first()
      .getByRole('button', { name: /^Favorite:/ })
      .click();
    await expect(page.getByText('Nothing saved yet')).toBeVisible();
  });
});
