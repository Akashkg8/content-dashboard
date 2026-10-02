import { expect, test } from '@playwright/test';

import { waitForSave } from './helpers';

test.describe('Mock authentication and profile', () => {
  test('signs in, edits the profile, survives a reload and signs out', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText('You are browsing as a guest')).toBeVisible();

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Sign in to Dispatch' });
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(dialog.getByText('Enter your name.')).toBeVisible();

    await dialog.getByLabel('Name').fill('Asha Rao');
    await dialog.getByLabel('Email').fill('asha@example.com');
    await dialog.getByRole('button', { name: 'Sign in' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Hello, Asha' })).toBeVisible();

    await page.getByLabel('Display name').fill('Asha Kulkarni');
    await page.getByLabel('Bio').fill('Space, cricket and good films.');
    await page.getByRole('radio', { name: 'plum' }).check({ force: true });
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('Profile saved.')).toBeVisible();
    await waitForSave(page, (saved) => JSON.stringify(saved.auth ?? {}).includes('Asha Kulkarni'));

    await page.goto('/');
    const account = page.getByRole('button', { name: 'Account: Asha Kulkarni' });
    await expect(account).toBeVisible();
    await account.click();
    await expect(page.getByText('asha@example.com')).toBeVisible();

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true }).first()).toBeVisible();
  });
});
