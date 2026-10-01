import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { badRequest, cachedJson, parseSearchParams, queryParam } from '@/server/route-utils';
import { searchMovies } from '@/server/sources/movies';
import { searchNews } from '@/server/sources/news';
import { searchSocial } from '@/server/sources/social';
import type { SearchResponse } from '@/types/content';

const schema = z.object({ q: queryParam });

/** GET /api/search?q=space — one query across news, movies and posts. */
export async function GET(request: NextRequest) {
  const query = parseSearchParams(request, schema);
  if (!query.success) return badRequest(query.error);

  const { q } = query.data;
  const [news, movies] = await Promise.all([searchNews(q), searchMovies(q)]);
  const social = searchSocial(q);
  return cachedJson<SearchResponse>({
    query: q,
    news: news.items,
    movies: movies.items,
    social: social.items,
    origins: { news: news.origin, movie: movies.origin, social: social.origin },
  });
}
