import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { makeStore } from '@/store';

import { SettingsView } from './SettingsView';
import { renderWithStore } from '../../../../tests/utils/renderWithStore';

const setup = async () => {
  const store = makeStore();
  renderWithStore(<SettingsView />, { store });
  await screen.findByRole('group', { name: 'Categories' });
  return store;
};

describe('SettingsView (integration)', () => {
  it('toggles categories and sources', async () => {
    const store = await setup();
    const science = screen.getByRole('button', { name: 'Science' });
    expect(science).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(science);
    await userEvent.click(screen.getByRole('button', { name: /^Movies/ }));

    expect(science).toHaveAttribute('aria-pressed', 'true');
    expect(store.getState().preferences.categories).toContain('science');
    expect(store.getState().preferences.sources).toEqual(['news', 'social']);
  });

  it('explains why the last category cannot be turned off', async () => {
    const store = await setup();
    for (const name of ['Technology', 'Finance', 'Sports']) {
      await userEvent.click(screen.getByRole('button', { name }));
    }
    await userEvent.click(screen.getByRole('button', { name: 'Entertainment' }));

    expect(screen.getByRole('status')).toHaveTextContent('Keep at least one category');
    expect(store.getState().preferences.categories).toEqual(['entertainment']);
  });

  it('follows, validates and unfollows hashtags', async () => {
    await setup();
    const input = screen.getByRole('textbox', { name: 'Hashtag to follow' });
    const list = () => screen.getByRole('list', { name: 'Followed hashtags' });

    await userEvent.type(input, '#Cricket{Enter}');
    expect(within(list()).getByText('#cricket')).toBeInTheDocument();
    expect(input).toHaveValue('');

    await userEvent.type(input, 'not ok!{Enter}');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/letters, numbers or underscores/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Unfollow #cricket' }));
    expect(within(list()).queryByText('#cricket')).not.toBeInTheDocument();
  });

  it('asks for confirmation before resetting', async () => {
    const store = await setup();
    await userEvent.click(screen.getByRole('button', { name: 'Science' }));

    await userEvent.click(screen.getByRole('button', { name: 'Reset preferences' }));
    expect(store.getState().preferences.categories).toContain('science');

    await userEvent.click(screen.getByRole('button', { name: 'Confirm: reset preferences' }));
    expect(store.getState().preferences.categories).not.toContain('science');
  });
});
