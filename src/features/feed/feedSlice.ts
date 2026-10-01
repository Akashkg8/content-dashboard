import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { arrayMoveById } from '@/lib/arrayMove';
import { hydrated } from '@/store/actions';

export interface FeedState {
  /** The user's drag-and-drop order of item ids. Items not listed keep their natural order. */
  order: string[];
}

/** Old ids pile up as news rotates; keep storage bounded. */
export const MAX_ORDER_LENGTH = 500;

const initialState: FeedState = { order: [] };

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    /**
     * `ids` is the full list as currently displayed, so moving within a
     * filtered view still lands in an intuitive place in the full feed.
     */
    reorderFeed(state, action: PayloadAction<{ ids: string[]; activeId: string; overId: string }>) {
      const { ids, activeId, overId } = action.payload;
      state.order = arrayMoveById(ids, activeId, overId).slice(0, MAX_ORDER_LENGTH);
    },
    resetFeedOrder: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(hydrated, (state, action) => action.payload.feed ?? state);
  },
});

export const { reorderFeed, resetFeedOrder } = feedSlice.actions;
export const feedReducer = feedSlice.reducer;
