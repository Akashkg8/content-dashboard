import { expect, test } from '@playwright/test';

import { cards, cardTitles, dragTo, openFeed, waitForSave } from './helpers';

test.describe('Drag and drop', () => {
  test('reorders feed cards with the mouse and keeps the order after reload', async ({ page }) => {
    await openFeed(page);
    const before = await cardTitles(page);

    await dragTo(
      page,
      cards(page)
        .nth(0)
        .getByRole('button', { name: /^Reorder:/ }),
      cards(page).nth(2),
    );

    await expect
      .poll(() => cardTitles(page).then((t) => t.slice(0, 3)))
      .toEqual([before[1], before[2], before[0]]);
    await waitForSave(
      page,
      (saved) => ((saved.feed as { order?: string[] })?.order?.length ?? 0) > 0,
    );

    await page.reload();
    await expect(cards(page)).toHaveCount(27);
    expect((await cardTitles(page)).slice(0, 3)).toEqual([before[1], before[2], before[0]]);

    await page.getByRole('button', { name: 'Reset order' }).click();
    await expect
      .poll(() => cardTitles(page).then((t) => t.slice(0, 3)))
      .toEqual(before.slice(0, 3));
  });

  test('reorders with the keyboard alone', async ({ page }) => {
    await openFeed(page);
    const before = await cardTitles(page);

    await cards(page)
      .nth(0)
      .getByRole('button', { name: /^Reorder:/ })
      .focus();
    await page.keyboard.press('Space');
    // dnd-kit announces each step in a live region. Like a screen-reader user,
    // wait to hear where the card is before the next key.
    await expect(page.getByText(/moved to position 1 of|Picked up/)).toBeAttached();
    await expect(async () => {
      await page.keyboard.press('ArrowRight');
      await expect(page.getByText(/moved to position 2 of/)).toBeAttached({ timeout: 500 });
    }).toPass({ timeout: 5_000 });
    await page.keyboard.press('Space');

    await expect.poll(() => cardTitles(page).then((t) => t[1])).toBe(before[0]);
    await expect(page.getByText(/^Dropped/)).toBeAttached();
  });

  test('reorders favorites', async ({ page }) => {
    await openFeed(page);
    for (const index of [0, 1, 2]) {
      await cards(page)
        .nth(index)
        .getByRole('button', { name: /^Favorite:/ })
        .click();
    }
    await page
      .getByRole('link', { name: /^Favorites/ })
      .first()
      .click();
    await expect(cards(page)).toHaveCount(3);
    const before = await cardTitles(page);

    await dragTo(
      page,
      cards(page)
        .nth(2)
        .getByRole('button', { name: /^Reorder:/ }),
      cards(page).nth(0),
    );

    await expect.poll(() => cardTitles(page)).toEqual([before[2], before[0], before[1]]);
  });
});
