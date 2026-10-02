import { expect, type Locator, type Page } from '@playwright/test';

/** Cards in the feed or favorites grid, in display order. */
export const cards = (page: Page) => page.getByTestId('feed-card');

export async function cardTitles(page: Page): Promise<string[]> {
  return cards(page).locator('h3').allTextContents();
}

/** Open the feed and wait until the first page of all three sources is in. */
export async function openFeed(page: Page) {
  await page.goto('/');
  await expect(cards(page)).toHaveCount(27);
}

/** Wait for the debounced localStorage write before reloading. */
export async function waitForSave(page: Page, check: (saved: Record<string, unknown>) => boolean) {
  await expect
    .poll(async () =>
      check(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem('dispatch:v1') ?? '{}') as Record<string, unknown>,
        ),
      ),
    )
    .toBe(true);
}

/**
 * Drag with real mouse events, in small steps, the way dnd-kit expects:
 * press on the handle, move past the activation distance, then drop.
 */
export async function dragTo(page: Page, handle: Locator, target: Locator) {
  const from = (await handle.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2, { steps: 4 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 });
  await page.mouse.up();
}
