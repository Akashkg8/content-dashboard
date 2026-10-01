import { type NextRequest } from 'next/server';
import { z } from 'zod';

import {
  badRequest,
  cachedJson,
  categoriesParam,
  hashtagsParam,
  pageParam,
  parseSearchParams,
} from '@/server/route-utils';
import { getSocialPage } from '@/server/sources/social';
import type { FeedPage } from '@/types/content';

const schema = z.object({
  categories: categoriesParam,
  hashtags: hashtagsParam,
  user: z
    .string()
    .regex(/^[a-z0-9_]{1,30}$/i)
    .optional(),
  page: pageParam,
});

/** GET /api/social?categories=sports&hashtags=webdev,space&user=devdiaries&page=1 */
export async function GET(request: NextRequest) {
  const query = parseSearchParams(request, schema);
  if (!query.success) return badRequest(query.error);

  const { page } = query.data;
  const result = getSocialPage(query.data);
  return cachedJson<FeedPage>({
    items: result.items,
    page,
    hasMore: result.hasMore,
    origins: { social: result.origin },
  });
}
