import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import type { SearchResponse } from '@/types/content';

import { SEARCH_DEBOUNCE_MS, SearchBar } from './SearchBar';
import { SearchView } from './SearchView';
import { mockNavigation, setSearch } from '../../../../tests/mocks/navigation';
import { server } from '../../../../tests/msw/server';
import { renderWithStore } from '../../../../tests/utils/renderWithStore';

describe('SearchBar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  const user = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  it('navigates once, after typing pauses', async () => {
    renderWithStore(<SearchBar />);
    await user().type(screen.getByRole('searchbox'), 'space');

    expect(mockNavigation.router.push).not.toHaveBeenCalled();
    await act(() => jest.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));

    expect(mockNavigation.router.push).toHaveBeenCalledTimes(1);
    expect(mockNavigation.router.push).toHaveBeenCalledWith('/search?q=space');
  });

  it('replaces the URL while refining on the results page', async () => {
    mockNavigation.pathname = '/search';
    setSearch('q=spa');
    renderWithStore(<SearchBar />);
    const box = screen.getByRole('searchbox');
    expect(box).toHaveValue('spa');

    await user().type(box, 'ce');
    await act(() => jest.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));

    expect(mockNavigation.router.replace).toHaveBeenCalledWith('/search?q=space');
    expect(mockNavigation.router.push).not.toHaveBeenCalled();
  });

  it('ignores one-letter queries and encodes special characters', async () => {
    renderWithStore(<SearchBar />);
    const box = screen.getByRole('searchbox');

    await user().type(box, 'a');
    await act(() => jest.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));
    expect(mockNavigation.router.push).not.toHaveBeenCalled();

    await user().type(box, ' & #b');
    await act(() => jest.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));
    expect(mockNavigation.router.push).toHaveBeenCalledWith('/search?q=a%20%26%20%23b');
  });

  it('focuses on "/" when it owns the shortcut, and clears on Escape', async () => {
    renderWithStore(<SearchBar shortcut />);
    const box = screen.getByRole('searchbox');

    await user().keyboard('/');
    expect(box).toHaveFocus();
    expect(box).toHaveValue('');

    await user().type(box, 'films');
    await user().keyboard('{Escape}');
    expect(box).toHaveValue('');
  });
});

describe('SearchView (integration)', () => {
  it('prompts for a query when there is none', () => {
    renderWithStore(<SearchView query="" />);
    expect(screen.getByText('What are you looking for?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '#cricket' })).toHaveAttribute(
      'href',
      '/search?q=%23cricket',
    );
  });

  it('shows results from every source and filters them', async () => {
    renderWithStore(<SearchView query="space" />);

    const results = await screen.findByRole('list', { name: 'Search results for space' });
    expect(within(results).getAllByRole('article')).toHaveLength(4);
    expect(screen.getByRole('status')).toHaveTextContent('4 results for space');

    await userEvent.click(screen.getByRole('button', { name: /^News/ }));
    expect(within(results).getAllByRole('article')).toHaveLength(2);
  });

  it('shows an empty state with suggestions when nothing matches', async () => {
    server.use(
      http.get('*/api/search', () =>
        HttpResponse.json<SearchResponse>({
          query: 'zzzz',
          news: [],
          movies: [],
          social: [],
          origins: {},
        }),
      ),
    );
    renderWithStore(<SearchView query="zzzz" />);

    expect(await screen.findByText('No results for “zzzz”')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'space' })).toBeInTheDocument();
  });

  it('shows an error with retry when search fails', async () => {
    server.use(http.get('*/api/search', () => HttpResponse.json({}, { status: 500 })));
    renderWithStore(<SearchView query="space" />);

    expect(await screen.findByText('Search is not responding')).toBeInTheDocument();
    server.resetHandlers();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('list', { name: 'Search results for space' }),
    ).toBeInTheDocument();
  });
});
