import { render, screen } from '@testing-library/react';

import { Providers } from '@/app/providers';

import { AppShell } from './AppShell';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}));

describe('AppShell', () => {
  beforeEach(() => {
    render(
      <Providers>
        <AppShell>
          <p>Page body</p>
        </AppShell>
      </Providers>,
    );
  });

  it('renders the page inside the main landmark', () => {
    expect(screen.getByRole('main')).toHaveTextContent('Page body');
  });

  it('has a skip link that targets the main landmark', () => {
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip).toHaveAttribute('href', `#${screen.getByRole('main').id}`);
  });

  it('offers search, theme and navigation controls', () => {
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle dark mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });
});
