import 'server-only';

import { z } from 'zod';

import { categoryForGenres } from '@/lib/genres';
import type { Category, ContentItem } from '@/types/content';

import { fetchProviderJson } from '../http';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';

const movieSchema = z.object({
  id: z.number(),
  title: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
  genre_ids: z.array(z.number()).nullable().optional(),
});

export const tmdbListSchema = z.object({
  page: z.number(),
  total_pages: z.number(),
  results: z.array(movieSchema),
});

export type TmdbMovie = z.infer<typeof movieSchema>;
export type TmdbList = z.infer<typeof tmdbListSchema>;

export function adaptMovie(movie: TmdbMovie, fallbackCategory: Category): ContentItem | null {
  const title = movie.title?.trim();
  if (!title) return null;
  const genreIds = movie.genre_ids ?? [];
  const rating = movie.vote_average ?? 0;
  const year = movie.release_date?.slice(0, 4);
  const image = movie.backdrop_path ?? movie.poster_path;
  return {
    id: `movie:${movie.id}`,
    source: 'movie',
    category: categoryForGenres(genreIds, fallbackCategory),
    title,
    description: movie.overview?.trim() || 'No synopsis yet.',
    imageUrl: image ? `${IMAGE_BASE}${image}` : null,
    url: `https://www.themoviedb.org/movie/${movie.id}`,
    ctaLabel: 'Play Now',
    publishedAt: movie.release_date
      ? `${movie.release_date}T00:00:00.000Z`
      : new Date(0).toISOString(),
    author:
      [rating ? `Rated ${rating.toFixed(1)}` : null, year].filter(Boolean).join(' · ') || 'TMDB',
    popularity: Math.round(rating * 10),
    genreIds,
  };
}

export function adaptMovies(list: TmdbList, fallbackCategory: Category): ContentItem[] {
  return list.results.flatMap((movie) => adaptMovie(movie, fallbackCategory) ?? []);
}

function tmdbUrl(path: string, apiKey: string, params: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`);
  url.search = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    include_adult: 'false',
    ...params,
  }).toString();
  return url;
}

/** Popular movies in any of the given genres (`|` means OR in TMDB). */
export function fetchDiscover(
  apiKey: string,
  { genres, page }: { genres: number[]; page: number },
) {
  return fetchProviderJson(
    tmdbUrl('/discover/movie', apiKey, {
      with_genres: genres.join('|'),
      sort_by: 'popularity.desc',
      'vote_count.gte': '200',
      page: String(page),
    }),
    tmdbListSchema,
  );
}

export function fetchTrendingMovies(apiKey: string) {
  return fetchProviderJson(tmdbUrl('/trending/movie/week', apiKey, {}), tmdbListSchema);
}

export function fetchMovieSearch(apiKey: string, query: string) {
  return fetchProviderJson(tmdbUrl('/search/movie', apiKey, { query, page: '1' }), tmdbListSchema);
}
