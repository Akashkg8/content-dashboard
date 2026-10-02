/**
 * Domain types shared by the server (route handlers) and the client (UI, store).
 * Every provider response is normalized into `ContentItem`, so the UI never
 * knows whether an item came from NewsAPI, TMDB or the mock social API.
 */

export const CATEGORIES = [
  'technology',
  'business',
  'sports',
  'entertainment',
  'health',
  'science',
] as const;
export type Category = (typeof CATEGORIES)[number];
/** Display names live in the translation files (src/i18n/locales). */

export const SOURCES = ['news', 'movie', 'social'] as const;
export type ContentSource = (typeof SOURCES)[number];

/** Where the data actually came from. Surfaced in the UI as a "Demo data" badge. */
export type DataOrigin = 'live' | 'mock';

export interface ContentItem {
  /** `${source}:${providerId}`. Stable across requests, used for favorites and ordering. */
  id: string;
  source: ContentSource;
  category: Category;
  title: string;
  description: string;
  imageUrl: string | null;
  /** Call-to-action target. Always an absolute https URL. */
  url: string;
  ctaLabel: 'Read More' | 'Play Now' | 'View Post';
  /** ISO 8601 timestamp. */
  publishedAt: string;
  /** Publisher name, movie rating label or social handle. */
  author: string;
  /** 0-100, comparable within a source. Drives trending order. */
  popularity: number;
  /** Movies only. TMDB genre ids, used for history-based recommendations. */
  genreIds?: number[];
  /** Social only. Lower-case, without the leading `#`. */
  hashtags?: string[];
}

export interface FeedPage {
  items: ContentItem[];
  page: number;
  hasMore: boolean;
  origins: Partial<Record<ContentSource, DataOrigin>>;
}

export type TrendingCategory = Category | 'all';

export interface TrendingResponse {
  category: TrendingCategory;
  news: ContentItem[];
  movies: ContentItem[];
  social: ContentItem[];
  origins: Partial<Record<ContentSource, DataOrigin>>;
}

export interface SearchResponse {
  query: string;
  news: ContentItem[];
  movies: ContentItem[];
  social: ContentItem[];
  origins: Partial<Record<ContentSource, DataOrigin>>;
}
