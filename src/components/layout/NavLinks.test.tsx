import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NavLinks } from './NavLinks';

const mockPathname = jest.fn(() => '/');
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname() }));

describe('NavLinks', () => {
  it('marks only the current section with aria-current', () => {
    mockPathname.mockReturnValue('/trending');
    render(<NavLinks />);

    expect(screen.getByRole('link', { name: 'Trending' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'My feed' })).not.toHaveAttribute('aria-current');
  });

  it('calls onNavigate when a link is chosen', async () => {
    const onNavigate = jest.fn();
    render(<NavLinks onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole('link', { name: 'Favorites' }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
