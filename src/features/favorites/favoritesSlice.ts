import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { arrayMoveById } from '@/lib/arrayMove';
import { hydrated } from '@/store/actions';
import type { ContentItem } from '@/types/content';

export interface FavoritesState {
  /** Display order. Newest first until the user drags them. */
  ids: string[];
  /**
   * A snapshot of each saved item. Favorites keep working after the API cache
   * expires or the provider drops the article.
   */
  items: Record<string, ContentItem>;
}

export const MAX_FAVORITES = 200;

const initialState: FavoritesState = { ids: [], items: {} };

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const item = action.payload;
      if (state.items[item.id]) {
        delete state.items[item.id];
        state.ids = state.ids.filter((id) => id !== item.id);
      } else if (state.ids.length < MAX_FAVORITES) {
        state.items[item.id] = item;
        state.ids.unshift(item.id);
      }
    },
    reorderFavorites(state, action: PayloadAction<{ activeId: string; overId: string }>) {
      state.ids = arrayMoveById(state.ids, action.payload.activeId, action.payload.overId);
    },
    clearFavorites: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(hydrated, (state, action) => action.payload.favorites ?? state);
  },
});

export const { toggleFavorite, reorderFavorites, clearFavorites } = favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;
