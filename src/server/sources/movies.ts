import 'server-only';

import { CATEGORY_GENRES, genresForCategories } from '@/lib/genres';
import type { Category, ContentItem, TrendingCategory } from '@/types/content';

import { getServerEnv } from '../env';
import { logFallback } from '../http';
import { byPopularity, matchesQuery, type SourceResult } from './types';
import { buildMockMovies } from '../mock/build';
import { MAX_PAGE, PAGE_SIZE, paginate } from '../paging';
import {
  adaptMovies,
  fetchDiscover,
  fetchMovieSearch,
  fetchTrendingMovies,
} from '../providers/tmdb';

function tmdbKey(): string | undefined {
  const env = getServerEnv();
  return env.USE_MOCK_DATA ? undefined : env.TMDB_API_KEY;
}

/**
 * How well a movie fits the user: genres of movies they favorited count
 * double, genres of their chosen categories count once. This is the
 * "recommendations from history" part of the feed.
 */
export function recommendationScore(
  movie: ContentItem,
  categoryGenres: readonly number[],
  historyGenres: readonly number[],
): number {
  const genres = movie.genreIds ?? [];
  const fromHistory = genres.filter((id) => historyGenres.includes(id)).length;
  const fromCategories = genres.filter((id) => categoryGenres.includes(id)).length;
  return fromHistory * 2 + fromCategories;
}

export async function getMoviesPage(
  categories: Category[],
  historyGenres: number[],
  page: number,
): Promise<SourceResult> {
  const categoryGenres = genresForCategories(categories);
  const rank = (a: ContentItem, b: ContentItem) =>
    recommendationScore(b, categoryGenres, historyGenres) -
      recommendationScore(a, categoryGenres, historyGenres) || byPopularity(a, b);

  const apiKey = tmdbKey();
  if (apiKey) {
    try {
      const genres = [...new Set([...historyGenres, ...categoryGenres])];
      const list = await fetchDiscover(apiKey, { genres, page });
      const items = adaptMovies(list, categories[0] ?? 'entertainment').sort(rank);
      return { items, hasMore: page < Math.min(list.total_pages, MAX_PAGE), origin: 'live' };
    } catch (error) {
      logFallback('movies', error);
    }
  }
  const items = buildMockMovies()
    .filter((movie) => recommendationScore(movie, categoryGenres, historyGenres) > 0)
    .sort(rank);
  return { ...paginate(items, page), origin: 'mock' };
}

export async function getTrendingMovies(category: TrendingCategory): Promise<SourceResult> {
  const inCategory = (movie: ContentItem) =>
    category === 'all' ||
    (movie.genreIds ?? []).some((id) => CATEGORY_GENRES[category].includes(id));

  const apiKey = tmdbKey();
  if (apiKey) {
    try {
      const fallback = category === 'all' ? 'entertainment' : category;
      let items = adaptMovies(await fetchTrendingMovies(apiKey), fallback).filter(inCategory);
      // Weekly trending is a short list. Top it up from discover when a category filters too much.
      if (items.length < 6 && category !== 'all') {
        const more = await fetchDiscover(apiKey, {
          genres: [...CATEGORY_GENRES[category]],
          page: 1,
        });
        items = [...items, ...adaptMovies(more, category)];
      }
      const unique = [...new Map(items.map((item) => [item.id, item])).values()];
      return {
        items: unique.sort(byPopularity).slice(0, PAGE_SIZE),
        hasMore: false,
        origin: 'live',
      };
    } catch (error) {
      logFallback('movies', error);
    }
  }
  const items = buildMockMovies().filter(inCategory).sort(byPopularity).slice(0, PAGE_SIZE);
  return { items, hasMore: false, origin: 'mock' };
}

export async function searchMovies(query: string): Promise<SourceResult> {
  const apiKey = tmdbKey();
  if (apiKey) {
    try {
      const items = adaptMovies(await fetchMovieSearch(apiKey, query), 'entertainment');
      return { items: items.slice(0, 12), hasMore: false, origin: 'live' };
    } catch (error) {
      logFallback('movies', error);
    }
  }
  const items = buildMockMovies().filter((movie) =>
    matchesQuery(query, movie.title, movie.description, movie.author),
  );
  return { items: items.slice(0, 12), hasMore: false, origin: 'mock' };
}
