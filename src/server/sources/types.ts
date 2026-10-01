import type { ContentItem, DataOrigin } from '@/types/content';

/** What every source service returns: the items plus where they really came from. */
export interface SourceResult {
  items: ContentItem[];
  hasMore: boolean;
  origin: DataOrigin;
}

export const byNewest = (a: ContentItem, b: ContentItem) =>
  b.publishedAt.localeCompare(a.publishedAt);
export const byPopularity = (a: ContentItem, b: ContentItem) => b.popularity - a.popularity;

/** Case-insensitive match where every word of the query appears in the text. */
export function matchesQuery(query: string, ...fields: (string | undefined)[]): boolean {
  const text = fields.join(' ').toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}
