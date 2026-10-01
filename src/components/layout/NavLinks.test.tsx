import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { toggleFavorite } from '@/features/favorites/favoritesSlice';
import { makeStore } from '@/store';

import { NavLinks } from './NavLinks';
import { makeContentItem } from '../../../tests/fixtures/content';
import { mockNavigation } from '../../../tests/mocks/navigation';
import { renderWithStore } from '../../../tests/utils/renderWithStore';

describe('NavLinks', () => {
  it('marks only the current section with aria-current', () => {
    mockNavigation.pathname = '/trending';
    renderWithStore(<NavLinks />);

    expect(screen.getByRole('link', { name: 'Trending' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'My feed' })).not.toHaveAttribute('aria-current');
  });

  it('calls onNavigate when a link is chosen', async () => {
    const onNavigate = jest.fn();
    renderWithStore(<NavLinks onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole('link', { name: 'Favorites' }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('shows how many favorites are saved', () => {
    const store = makeStore();
    store.dispatch(toggleFavorite(makeContentItem()));
    store.dispatch(toggleFavorite(makeContentItem()));
    renderWithStore(<NavLinks />, { store });

    expect(screen.getByRole('link', { name: 'Favorites 2 saved' })).toBeInTheDocument();
  });
});
