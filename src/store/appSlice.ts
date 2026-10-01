import { createSlice } from '@reduxjs/toolkit';

import { hydrated } from './actions';

/**
 * `hydrated` flips to true once saved state is loaded. Pages that depend on
 * localStorage (favorites, profile) show a skeleton until then, instead of
 * flashing an empty state.
 */
const appSlice = createSlice({
  name: 'app',
  initialState: { hydrated: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(hydrated, (state) => {
      state.hydrated = true;
    });
  },
});

export const appReducer = appSlice.reducer;
