import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsView } from '@/features/preferences/components/SettingsView';

import { en } from './locales/en';
import { hi } from './locales/hi';
import { renderWithStore } from '../../tests/utils/renderWithStore';

/** Every leaf key, as dotted paths: `feed.title`, `profile.colors.ink`... */
const keysOf = (tree: object, prefix = ''): string[] =>
  Object.entries(tree).flatMap(([key, child]) =>
    typeof child === 'string' ? [`${prefix}${key}`] : keysOf(child as object, `${prefix}${key}.`),
  );

const lookup = (tree: object, key: string) =>
  key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], tree);

const placeholders = (text: string) => (text.match(/\{\{\w+\}\}/g) ?? []).sort();

describe('translations', () => {
  it('Hindi defines exactly the English keys, with no empty strings', () => {
    expect(keysOf(hi).sort()).toEqual(keysOf(en).sort());
    expect(keysOf(hi).filter((key) => !lookup(hi, key))).toEqual([]);
  });

  it('keeps every interpolation placeholder in Hindi', () => {
    for (const key of keysOf(en)) {
      const expected = placeholders(lookup(en, key) as string);
      expect([key, placeholders(lookup(hi, key) as string)]).toEqual([key, expected]);
    }
  });

  it('switches the interface and the page language from settings', async () => {
    const { store } = renderWithStore(<SettingsView />);
    await screen.findByRole('group', { name: 'Categories' });

    await userEvent.click(screen.getByRole('radio', { name: 'हिन्दी' }));

    expect(store.getState().preferences.language).toBe('hi');
    expect(await screen.findByRole('heading', { level: 1, name: 'सेटिंग्स' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'वित्त' })).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.lang).toBe('hi'));

    await userEvent.click(screen.getByRole('radio', { name: 'English' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
  });
});
