import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { badRequest, cachedJson, parseSearchParams } from '@/server/route-utils';
import { getTrendingMovies } from '@/server/sources/movies';
import { getTopNews } from '@/server/sources/news';
import { getTrendingSocial } from '@/server/sources/social';
import { CATEGORIES, type TrendingResponse } from '@/types/content';

const schema = z.object({ category: z.enum(['all', ...CATEGORIES]).default('all') });

/** GET /api/trending?category=sports — the most popular items from every source. */
export async function GET(request: NextRequest) {
  const query = parseSearchParams(request, schema);
  if (!query.success) return badRequest(query.error);

  const { category } = query.data;
  const [news, movies] = await Promise.all([getTopNews(category), getTrendingMovies(category)]);
  const social = getTrendingSocial(category);
  return cachedJson<TrendingResponse>({
    category,
    news: news.items,
    movies: movies.items,
    social: social.items,
    origins: { news: news.origin, movie: movies.origin, social: social.origin },
  });
}
