import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Language } from '@/i18n';
import { normalizeHashtag } from '@/lib/hashtags';
import { hydrated } from '@/store/actions';
import { CATEGORIES, SOURCES, type Category, type ContentSource } from '@/types/content';

export interface PreferencesState {
  categories: Category[];
  sources: ContentSource[];
  /** Followed hashtags, lower-case, without `#`. Matching posts join the feed. */
  hashtags: string[];
  /** Interface language. Content stays in the language it was published in. */
  language: Language;
}

export const MAX_HASHTAGS = 10;

export const initialPreferences: PreferencesState = {
  categories: ['technology', 'business', 'sports', 'entertainment'],
  sources: [...SOURCES],
  hashtags: ['webdev', 'space'],
  language: 'en',
};

/** Keep the canonical order so cache keys stay stable no matter the click order. */
const sortBy = <T extends string>(values: T[], canonical: readonly T[]) =>
  canonical.filter((value) => values.includes(value));

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: initialPreferences,
  reducers: {
    /** At least one category must stay selected, or the feed would be empty. */
    toggleCategory(state, action: PayloadAction<Category>) {
      const category = action.payload;
      if (state.categories.includes(category)) {
        if (state.categories.length > 1) {
          state.categories = state.categories.filter((c) => c !== category);
        }
      } else {
        state.categories = sortBy([...state.categories, category], CATEGORIES);
      }
    },
    /** At least one source must stay selected. */
    toggleSource(state, action: PayloadAction<ContentSource>) {
      const source = action.payload;
      if (state.sources.includes(source)) {
        if (state.sources.length > 1) state.sources = state.sources.filter((s) => s !== source);
      } else {
        state.sources = sortBy([...state.sources, source], SOURCES);
      }
    },
    addHashtag(state, action: PayloadAction<string>) {
      const tag = normalizeHashtag(action.payload);
      if (tag && !state.hashtags.includes(tag) && state.hashtags.length < MAX_HASHTAGS) {
        state.hashtags.push(tag);
      }
    },
    removeHashtag(state, action: PayloadAction<string>) {
      state.hashtags = state.hashtags.filter((tag) => tag !== action.payload);
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    /** Resets content choices. The language is a display setting, so it is kept. */
    resetPreferences: (state) => ({ ...initialPreferences, language: state.language }),
  },
  extraReducers: (builder) => {
    // Saves from before the language setting existed lack the field.
    builder.addCase(hydrated, (state, action) =>
      action.payload.preferences ? { ...state, ...action.payload.preferences } : state,
    );
  },
});

export { normalizeHashtag };

export const {
  toggleCategory,
  toggleSource,
  addHashtag,
  removeHashtag,
  setLanguage,
  resetPreferences,
} = preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
