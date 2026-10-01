import 'server-only';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { normalizeHashtag } from '@/lib/hashtags';
import { CATEGORIES } from '@/types/content';

import { PROVIDER_REVALIDATE_SECONDS } from './http';
import { MAX_PAGE } from './paging';

/** `a,b,,c` becomes `['a', 'b', 'c']`. */
const csv = z
  .string()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
      : [],
  );

export const categoriesParam = csv
  .pipe(z.array(z.enum(CATEGORIES)).max(CATEGORIES.length))
  .transform((categories) => (categories.length ? [...new Set(categories)] : [...CATEGORIES]));

export const pageParam = z.coerce.number().int().min(1).max(MAX_PAGE).default(1);

export const genresParam = csv
  .transform((parts) => parts.map(Number))
  .pipe(z.array(z.number().int().positive().max(100_000)).max(20));

export const hashtagsParam = csv.transform((tags) =>
  tags.flatMap((tag) => normalizeHashtag(tag) ?? []).slice(0, 10),
);

export const queryParam = z.string().trim().min(2).max(100);

/** Validate `request.nextUrl.searchParams` against a zod object schema. */
export function parseSearchParams<T extends z.ZodType>(request: NextRequest, schema: T) {
  return schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
}

/** JSON with CDN caching. Identical requests within 5 minutes never reach the providers. */
export function cachedJson<T>(data: T) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${PROVIDER_REVALIDATE_SECONDS}, stale-while-revalidate=600`,
    },
  });
}

export function badRequest(error: z.ZodError) {
  return NextResponse.json(
    { error: 'Invalid query parameters', issues: z.flattenError(error).fieldErrors },
    { status: 400 },
  );
}
