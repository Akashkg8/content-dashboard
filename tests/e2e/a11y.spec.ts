import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/trending', '/favorites', '/search?q=space', '/settings', '/profile'];

/** Automated WCAG 2.1 A/AA checks in both themes. Catches contrast, labels, roles and landmarks. */
for (const theme of ['light', 'dark'] as const) {
  test.describe(`Accessibility (${theme})`, () => {
    test.use({ colorScheme: theme });

    for (const path of PAGES) {
      test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
        await page.goto(path);
        // Let data load and entrance animations finish so contrast is measured at rest.
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1200);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        const summary = results.violations.map(
          (violation) =>
            `${violation.id} (${violation.impact}): ${violation.nodes
              .slice(0, 3)
              .map((node) => node.target.join(' '))
              .join(' | ')}`,
        );
        expect(summary).toEqual([]);
      });
    }
  });
}
