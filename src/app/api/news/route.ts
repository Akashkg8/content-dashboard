import { type NextRequest } from 'next/server';
import { z } from 'zod';

import {
  badRequest,
  cachedJson,
  categoriesParam,
  pageParam,
  parseSearchParams,
} from '@/server/route-utils';
import { getNewsPage } from '@/server/sources/news';
import type { FeedPage } from '@/types/content';

const schema = z.object({ categories: categoriesParam, page: pageParam });

/** GET /api/news?categories=technology,sports&page=1 */
export async function GET(request: NextRequest) {
  const query = parseSearchParams(request, schema);
  if (!query.success) return badRequest(query.error);

  const { categories, page } = query.data;
  const result = await getNewsPage(categories, page);
  return cachedJson<FeedPage>({
    items: result.items,
    page,
    hasMore: result.hasMore,
    origins: { news: result.origin },
  });
}
