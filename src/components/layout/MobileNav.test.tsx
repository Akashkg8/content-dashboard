import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobileNav } from './MobileNav';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));

/**
 * The dialog stays in the DOM but is hidden until opened. Name computation is
 * skipped for hidden elements, so query by role only.
 */
const getDrawer = () => screen.getByRole('dialog', { hidden: true });

describe('MobileNav', () => {
  it('opens the drawer from the menu button', async () => {
    render(<MobileNav />);
    expect(getDrawer()).not.toHaveAttribute('open');

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(getDrawer()).toHaveAttribute('open');
    expect(screen.getByRole('link', { name: 'Trending' })).toBeVisible();
  });

  it('closes from the close button', async () => {
    render(<MobileNav />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }));

    expect(getDrawer()).not.toHaveAttribute('open');
  });

  it('closes after a link is chosen', async () => {
    render(<MobileNav />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    await userEvent.click(screen.getByRole('link', { name: 'Settings' }));

    expect(getDrawer()).not.toHaveAttribute('open');
  });

  it('closes when the backdrop is clicked', async () => {
    render(<MobileNav />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    await userEvent.click(getDrawer());

    expect(getDrawer()).not.toHaveAttribute('open');
  });
});
