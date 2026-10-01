import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContentCard } from '@/components/content/ContentCard';
import { makeStore } from '@/store';

import { makeContentItem } from '../../../../tests/fixtures/content';
import { renderWithStore } from '../../../../tests/utils/renderWithStore';
import { toggleFavorite } from '../favoritesSlice';
import { FavoritesView } from './FavoritesView';

describe('Favorites (integration)', () => {
  it('saves from a card and shows it on the favorites page', async () => {
    const store = makeStore();
    const item = makeContentItem({ title: 'Telescope finds galaxy' });
    const { unmount } = renderWithStore(<ContentCard item={item} />, { store });

    const heart = screen.getByRole('button', { name: 'Favorite: Telescope finds galaxy' });
    expect(heart).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(heart);
    expect(heart).toHaveAttribute('aria-pressed', 'true');
    unmount();

    renderWithStore(<FavoritesView />, { store });
    const list = await screen.findByRole('list', { name: 'Your favorites' });
    expect(
      within(list).getByRole('heading', { name: 'Telescope finds galaxy' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 saved item/)).toBeInTheDocument();
  });

  it('removes an item when its heart is pressed again', async () => {
    const store = makeStore();
    store.dispatch(toggleFavorite(makeContentItem({ title: 'Keep me' })));
    store.dispatch(toggleFavorite(makeContentItem({ title: 'Remove me' })));
    renderWithStore(<FavoritesView />, { store });

    await userEvent.click(await screen.findByRole('button', { name: 'Favorite: Remove me' }));

    expect(screen.queryByRole('heading', { name: 'Remove me' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Keep me' })).toBeInTheDocument();
  });

  it('shows an empty state with a way back to the feed', async () => {
    renderWithStore(<FavoritesView />);
    expect(await screen.findByText('Nothing saved yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse my feed' })).toHaveAttribute('href', '/');
  });

  it('gives every card an accessible drag handle', async () => {
    const store = makeStore();
    store.dispatch(toggleFavorite(makeContentItem({ title: 'Draggable' })));
    renderWithStore(<FavoritesView />, { store });

    const handle = await screen.findByRole('button', { name: 'Reorder: Draggable' });
    expect(handle).toHaveAttribute('aria-roledescription', 'sortable');
    expect(handle).toHaveAttribute('aria-describedby');
  });

  it('opens card links safely in a new tab', () => {
    renderWithStore(
      <ContentCard item={makeContentItem({ title: 'Story', url: 'https://example.com/a' })} />,
    );
    const link = screen.getByRole('link', { name: /Read More: Story/ });
    expect(link).toHaveAttribute('href', 'https://example.com/a');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
