import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/features/auth/authSlice';
import { favoritesReducer } from '@/features/favorites/favoritesSlice';
import { feedReducer } from '@/features/feed/feedSlice';
import { preferencesReducer } from '@/features/preferences/preferencesSlice';
import { contentApi } from '@/services/contentApi';

import { appReducer } from './appSlice';
import { createPersistenceMiddleware } from './persistence';

export const rootReducer = combineReducers({
  app: appReducer,
  preferences: preferencesReducer,
  favorites: favoritesReducer,
  feed: feedReducer,
  auth: authReducer,
  [contentApi.reducerPath]: contentApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * A new store per app mount, never a module-level singleton: on the server a
 * shared store would leak one visitor's state into another's render.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault().concat(contentApi.middleware, createPersistenceMiddleware()),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
