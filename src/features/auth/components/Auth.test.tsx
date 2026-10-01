import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { makeStore } from '@/store';

import { renderWithStore } from '../../../../tests/utils/renderWithStore';
import { signIn } from '../authSlice';
import { ProfileView } from './ProfileView';
import { UserMenu } from './UserMenu';

describe('Sign in and account menu (integration)', () => {
  it('validates the form, signs in, and shows the account menu', async () => {
    const store = makeStore();
    renderWithStore(<UserMenu />, { store });

    await userEvent.click(await screen.findByRole('button', { name: 'Sign in' }));
    const dialog = screen.getByRole('dialog', { name: 'Sign in to Dispatch' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Sign in' }));
    expect(within(dialog).getByText('Enter your name.')).toBeInTheDocument();
    expect(within(dialog).getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );

    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'Asha Rao');
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Email' }),
      'asha@example.com',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Sign in' }));

    expect(store.getState().auth.user).toMatchObject({
      name: 'Asha Rao',
      email: 'asha@example.com',
    });
    const account = await screen.findByRole('button', { name: 'Account: Asha Rao' });
    expect(account).toHaveTextContent('AR');

    await userEvent.click(account);
    expect(account).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('asha@example.com')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(account).toHaveAttribute('aria-expanded', 'false');
    expect(account).toHaveFocus();
  });

  it('signs out from the menu', async () => {
    const store = makeStore();
    store.dispatch(signIn({ name: 'Asha', email: 'asha@example.com' }));
    renderWithStore(<UserMenu />, { store });

    await userEvent.click(await screen.findByRole('button', { name: 'Account: Asha' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(store.getState().auth.user).toBeNull();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});

describe('ProfileView (integration)', () => {
  it('asks guests to sign in', async () => {
    renderWithStore(<ProfileView />);
    expect(await screen.findByText('You are browsing as a guest')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in to continue' })).toBeInTheDocument();
  });

  it('edits and saves the profile', async () => {
    const store = makeStore();
    store.dispatch(signIn({ name: 'Asha Rao', email: 'asha@example.com' }));
    renderWithStore(<ProfileView />, { store });

    const save = await screen.findByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();

    const name = screen.getByRole('textbox', { name: 'Display name' });
    await userEvent.clear(name);
    await userEvent.type(name, 'Asha R.');
    await userEvent.type(screen.getByRole('textbox', { name: 'Bio' }), 'Space and cricket.');
    await userEvent.click(screen.getByRole('radio', { name: 'ocean' }));
    await userEvent.click(save);

    expect(store.getState().auth.user).toMatchObject({
      name: 'Asha R.',
      bio: 'Space and cricket.',
      avatarColor: 'ocean',
    });
    expect(screen.getByText('Profile saved.')).toBeInTheDocument();
  });

  it('rejects an empty name', async () => {
    const store = makeStore();
    store.dispatch(signIn({ name: 'Asha', email: 'asha@example.com' }));
    renderWithStore(<ProfileView />, { store });

    await userEvent.clear(await screen.findByRole('textbox', { name: 'Display name' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByText('Your name cannot be empty.')).toBeInTheDocument();
    expect(store.getState().auth.user?.name).toBe('Asha');
  });
});
