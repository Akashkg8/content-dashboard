import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Providers } from '@/app/providers';

import { ThemeToggle } from './ThemeToggle';

function renderToggle() {
  render(
    <Providers>
      <ThemeToggle />
    </Providers>,
  );
  return screen.getByRole('button', { name: 'Toggle dark mode' });
}

describe('ThemeToggle', () => {
  afterEach(() => document.documentElement.classList.remove('dark', 'light'));

  it('switches to dark mode and persists the choice', async () => {
    await userEvent.click(renderToggle());

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });

  it('switches back to light mode on a second click', async () => {
    const button = renderToggle();

    await userEvent.click(button);
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    await userEvent.click(button);

    await waitFor(() => expect(document.documentElement).toHaveClass('light'));
    expect(window.localStorage.getItem('theme')).toBe('light');
  });
});
