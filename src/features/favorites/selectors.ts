import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';

const selectFavorites = (state: RootState) => state.favorites;

export const selectIsFavorite = (state: RootState, id: string) => id in state.favorites.items;

export const selectFavoriteCount = (state: RootState) => state.favorites.ids.length;

export const selectFavoriteItems = createSelector([selectFavorites], (favorites) =>
  favorites.ids.flatMap((id) => favorites.items[id] ?? []),
);

/** How many favorite genres feed into recommendations. */
export const HISTORY_GENRE_LIMIT = 3;

/**
 * The user's "watch history" signal: the most common genres among favorited
 * movies. Sorted by id at the end so the RTK Query cache key is stable.
 */
export const selectHistoryGenres = createSelector([selectFavorites], (favorites) => {
  const counts = new Map<number, number>();
  for (const id of favorites.ids) {
    for (const genre of favorites.items[id]?.genreIds ?? []) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(([genreA, countA], [genreB, countB]) => countB - countA || genreA - genreB)
    .slice(0, HISTORY_GENRE_LIMIT)
    .map(([genre]) => genre)
    .sort((a, b) => a - b);
});
