import { type NextRequest } from 'next/server';
import { z } from 'zod';

import {
  badRequest,
  cachedJson,
  categoriesParam,
  genresParam,
  pageParam,
  parseSearchParams,
} from '@/server/route-utils';
import { getMoviesPage } from '@/server/sources/movies';
import type { FeedPage } from '@/types/content';

const schema = z.object({ categories: categoriesParam, genres: genresParam, page: pageParam });

/**
 * GET /api/movies?categories=science&genres=878,18&page=1
 * `genres` are genres of movies the user favorited. They boost recommendations.
 */
export async function GET(request: NextRequest) {
  const query = parseSearchParams(request, schema);
  if (!query.success) return badRequest(query.error);

  const { categories, genres, page } = query.data;
  const result = await getMoviesPage(categories, genres, page);
  return cachedJson<FeedPage>({
    items: result.items,
    page,
    hasMore: result.hasMore,
    origins: { movie: result.origin },
  });
}
