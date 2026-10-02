import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { reorderFeed } from '@/features/feed/feedSlice';
import { makeStore } from '@/store';
import type { FeedPage } from '@/types/content';

import { FeedView } from './FeedView';
import { makeContentItem } from '../../../../tests/fixtures/content';
import { server } from '../../../../tests/msw/server';
import { renderWithStore } from '../../../../tests/utils/renderWithStore';

const feedList = () => screen.findByRole('list', { name: 'Your feed' });
const cardSources = (list: HTMLElement) =>
  within(list)
    .getAllByRole('article')
    .map((card) => within(card).getByText(/^(News|Movie|Post)$/).textContent);

describe('FeedView (integration)', () => {
  it('merges the three sources round-robin into one feed', async () => {
    renderWithStore(<FeedView />);

    const list = await feedList();
    await waitFor(() => expect(within(list).getAllByRole('article')).toHaveLength(9));
    expect(cardSources(list).slice(0, 6)).toEqual([
      'News',
      'Movie',
      'Post',
      'News',
      'Movie',
      'Post',
    ]);
    expect(screen.getByText('Demo data')).toBeInTheDocument();
  });

  it('loads the next page from every source with "Load more"', async () => {
    renderWithStore(<FeedView />);
    const list = await feedList();
    await waitFor(() => expect(within(list).getAllByRole('article')).toHaveLength(9));

    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));

    await waitFor(() => expect(within(list).getAllByRole('article')).toHaveLength(18));
    expect(await screen.findByText("You're all caught up.")).toBeInTheDocument();
  });

  it('filters by source with the chips', async () => {
    renderWithStore(<FeedView />);
    const list = await feedList();
    await waitFor(() => expect(within(list).getAllByRole('article')).toHaveLength(9));

    await userEvent.click(screen.getByRole('button', { name: /^Movies/ }));

    expect(cardSources(list)).toEqual(['Movie', 'Movie', 'Movie']);
    expect(screen.getByRole('button', { name: /^Movies/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the rest of the feed when one source fails, and retries it', async () => {
    let fail = true;
    server.use(
      http.get('*/api/movies', ({ request }) => {
        if (fail) return HttpResponse.json({ error: 'down' }, { status: 502 });
        const page = Number(new URL(request.url).searchParams.get('page'));
        return HttpResponse.json<FeedPage>({
          items: [makeContentItem({ source: 'movie', title: 'Recovered movie' })],
          page,
          hasMore: false,
          origins: { movie: 'live' },
        });
      }),
    );
    renderWithStore(<FeedView />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Movies could not load');
    expect(within(await feedList()).getAllByRole('article')).toHaveLength(6);

    fail = false;
    await userEvent.click(within(alert).getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Recovered movie' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error state with retry when every source fails', async () => {
    server.use(http.get('*/api/:source', () => HttpResponse.error()));
    renderWithStore(<FeedView />);

    expect(await screen.findByText('Your feed could not load')).toBeInTheDocument();
    server.resetHandlers();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await feedList()).toBeInTheDocument();
  });

  it('shows an empty state when sources return nothing', async () => {
    server.use(
      http.get('*/api/:source', () =>
        HttpResponse.json<FeedPage>({ items: [], page: 1, hasMore: false, origins: {} }),
      ),
    );
    renderWithStore(<FeedView />);

    expect(await screen.findByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Choose topics' })).toHaveAttribute(
      'href',
      '/settings',
    );
  });

  it('applies and resets the saved drag-and-drop order', async () => {
    const store = makeStore();
    renderWithStore(<FeedView />, { store });
    const list = await feedList();
    await waitFor(() => expect(within(list).getAllByRole('article')).toHaveLength(9));
    const titles = () =>
      within(list)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent);
    const before = titles();
    const ids = within(list)
      .getAllByTestId('feed-card')
      .map((card) => card.dataset.id!);

    store.dispatch(reorderFeed({ ids, activeId: ids[8]!, overId: ids[0]! }));

    await waitFor(() => expect(titles()[0]).toBe(before[8]));
    await userEvent.click(screen.getByRole('button', { name: 'Reset order' }));
    await waitFor(() => expect(titles()).toEqual(before));
  });

  it('only requests the sources and categories the user picked', async () => {
    const requested: string[] = [];
    server.events.on('request:start', ({ request }) => {
      requested.push(new URL(request.url).pathname + new URL(request.url).search);
    });
    renderWithStore(<FeedView />, {
      preloadedState: {
        preferences: { categories: ['science'], sources: ['news'], hashtags: [], language: 'en' },
      },
    });

    await waitFor(() => expect(requested.some((url) => url.startsWith('/api/news'))).toBe(true));
    expect(requested.find((url) => url.startsWith('/api/news'))).toContain('categories=science');
    expect(
      requested.some((url) => url.startsWith('/api/movies') || url.startsWith('/api/social')),
    ).toBe(false);
    server.events.removeAllListeners();
  });
});
