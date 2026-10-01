import { makeStore } from '@/store';


import { reorderFavorites, toggleFavorite } from './favoritesSlice';
import {
  selectFavoriteCount,
  selectFavoriteItems,
  selectHistoryGenres,
  selectIsFavorite,
} from './selectors';
import { makeContentItem } from '../../../tests/fixtures/content';

describe('favorites', () => {
  it('adds newest first and removes on a second toggle', () => {
    const store = makeStore();
    const a = makeContentItem({ title: 'A' });
    const b = makeContentItem({ title: 'B' });

    store.dispatch(toggleFavorite(a));
    store.dispatch(toggleFavorite(b));
    expect(selectFavoriteItems(store.getState()).map((item) => item.title)).toEqual(['B', 'A']);
    expect(selectIsFavorite(store.getState(), a.id)).toBe(true);

    store.dispatch(toggleFavorite(a));
    expect(selectIsFavorite(store.getState(), a.id)).toBe(false);
    expect(selectFavoriteCount(store.getState())).toBe(1);
  });

  it('reorders by drag ids', () => {
    const store = makeStore();
    const items = ['A', 'B', 'C'].map((title) => makeContentItem({ title }));
    items.forEach((item) => store.dispatch(toggleFavorite(item)));
    const [c, , a] = selectFavoriteItems(store.getState());

    store.dispatch(reorderFavorites({ activeId: a!.id, overId: c!.id }));

    expect(selectFavoriteItems(store.getState()).map((item) => item.title)).toEqual([
      'A',
      'C',
      'B',
    ]);
  });

  it('derives the top genres of favorited movies for recommendations', () => {
    const store = makeStore();
    store.dispatch(toggleFavorite(makeContentItem({ source: 'movie', genreIds: [878, 18] })));
    store.dispatch(toggleFavorite(makeContentItem({ source: 'movie', genreIds: [878, 12] })));
    store.dispatch(toggleFavorite(makeContentItem({ source: 'movie', genreIds: [878, 18, 99] })));
    store.dispatch(toggleFavorite(makeContentItem({ source: 'news' })));

    // 878 x3, 18 x2, then the 1-count tie broken by the lower id (12). Sorted for a stable cache key.
    expect(selectHistoryGenres(store.getState())).toEqual([12, 18, 878]);
  });

  it('memoizes derived lists', () => {
    const store = makeStore();
    store.dispatch(toggleFavorite(makeContentItem()));
    const state = store.getState();
    expect(selectFavoriteItems(state)).toBe(selectFavoriteItems(state));
    expect(selectHistoryGenres(state)).toBe(selectHistoryGenres(state));
  });
});
