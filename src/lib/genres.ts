import type { Category } from '@/types/content';

/**
 * TMDB has no "business" or "technology" genre, so each category maps to the
 * closest film genres. Ids are TMDB's official genre ids.
 */
export const CATEGORY_GENRES: Record<Category, readonly number[]> = {
  technology: [878, 9648],
  business: [18, 36],
  sports: [28, 12],
  entertainment: [35, 10402, 16],
  health: [10751, 10749, 99],
  science: [878, 99],
};

export const GENRE_NAMES: Record<number, string> = {
  12: 'Adventure',
  16: 'Animation',
  18: 'Drama',
  28: 'Action',
  35: 'Comedy',
  36: 'History',
  53: 'Thriller',
  80: 'Crime',
  99: 'Documentary',
  9648: 'Mystery',
  10402: 'Music',
  10749: 'Romance',
  10751: 'Family',
  878: 'Science Fiction',
};

/** Pick the category whose genres overlap most with a movie's genres. */
export function categoryForGenres(genreIds: readonly number[], fallback: Category): Category {
  let best: Category = fallback;
  let bestScore = 0;
  for (const [category, genres] of Object.entries(CATEGORY_GENRES) as [Category, number[]][]) {
    const score = genreIds.filter((id) => genres.includes(id)).length;
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }
  return best;
}

/** Unique genre ids for a set of categories, in a stable order. */
export function genresForCategories(categories: readonly Category[]): number[] {
  return [...new Set(categories.flatMap((category) => CATEGORY_GENRES[category]))].sort(
    (a, b) => a - b,
  );
}
