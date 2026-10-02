import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { z } from 'zod';

import { AVATAR_COLORS, signIn, signOut, updateProfile } from '@/features/auth/authSlice';
import type { AuthState } from '@/features/auth/authSlice';
import {
  clearFavorites,
  reorderFavorites,
  toggleFavorite,
} from '@/features/favorites/favoritesSlice';
import type { FavoritesState } from '@/features/favorites/favoritesSlice';
import { reorderFeed, resetFeedOrder } from '@/features/feed/feedSlice';
import type { FeedState } from '@/features/feed/feedSlice';
import {
  addHashtag,
  removeHashtag,
  resetPreferences,
  setLanguage,
  toggleCategory,
  toggleSource,
} from '@/features/preferences/preferencesSlice';
import type { PreferencesState } from '@/features/preferences/preferencesSlice';
import { LANGUAGES } from '@/i18n';
import { contentItemSchema } from '@/lib/schemas';
import { CATEGORIES, SOURCES } from '@/types/content';

export const STORAGE_KEY = 'dispatch:v1';
export const SAVE_DELAY_MS = 250;

export interface PersistedState {
  preferences: PreferencesState;
  favorites: FavoritesState;
  feed: FeedState;
  auth: AuthState;
}

/**
 * Schemas for each saved slice. Anything in localStorage may be stale from an
 * older version, edited by hand or corrupted, so it is validated before use.
 */
const sliceSchemas = {
  preferences: z.object({
    categories: z.array(z.enum(CATEGORIES)).min(1),
    sources: z.array(z.enum(SOURCES)).min(1),
    hashtags: z.array(z.string().regex(/^[a-z0-9_]{1,30}$/)).max(10),
    language: z.enum(LANGUAGES).default('en'),
  }),
  favorites: z
    .object({ ids: z.array(z.string()), items: z.record(z.string(), contentItemSchema) })
    .refine((value) => value.ids.every((id) => id in value.items)),
  feed: z.object({ order: z.array(z.string()).max(500) }),
  auth: z.object({
    user: z
      .object({
        name: z.string().min(1).max(60),
        email: z.email(),
        bio: z.string().max(280),
        avatarColor: z.enum(AVATAR_COLORS),
        joinedAt: z.string(),
      })
      .nullable(),
  }),
} satisfies { [K in keyof PersistedState]: z.ZodType };

/** Read saved state. Each slice is validated on its own, so one bad slice does not wipe the rest. */
export function loadState(storage: Storage | undefined = safeStorage()): Partial<PersistedState> {
  if (!storage) return {};
  let raw: unknown;
  try {
    raw = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return {};
  }
  if (!raw || typeof raw !== 'object') return {};

  const result: Partial<PersistedState> = {};
  for (const key of Object.keys(sliceSchemas) as (keyof PersistedState)[]) {
    const parsed = sliceSchemas[key].safeParse((raw as Record<string, unknown>)[key]);
    if (parsed.success) Object.assign(result, { [key]: parsed.data });
  }
  return result;
}

/** The slices that are written to localStorage. */
export function selectPersisted(state: PersistedState): PersistedState {
  const { preferences, favorites, feed, auth } = state;
  return { preferences, favorites, feed, auth };
}

export function saveState(state: PersistedState, storage: Storage | undefined = safeStorage()) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage disabled (Safari private mode). The app keeps working in memory.
  }
}

/** localStorage can throw on access when cookies are blocked, so even reading the property is guarded. */
function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

const persistedActions = isAnyOf(
  toggleCategory,
  toggleSource,
  addHashtag,
  removeHashtag,
  resetPreferences,
  setLanguage,
  toggleFavorite,
  reorderFavorites,
  clearFavorites,
  reorderFeed,
  resetFeedOrder,
  signIn,
  updateProfile,
  signOut,
);

/**
 * Saves the persisted slices after any action that changes them, debounced so
 * a burst of clicks or drags writes once.
 */
export function createPersistenceMiddleware() {
  const listener = createListenerMiddleware();
  listener.startListening({
    matcher: persistedActions,
    effect: async (_action, api) => {
      api.cancelActiveListeners();
      await api.delay(SAVE_DELAY_MS);
      saveState(selectPersisted(api.getState() as PersistedState));
    },
  });
  return listener.middleware;
}
