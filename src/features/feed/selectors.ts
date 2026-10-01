import type { ContentItem, FeedPage } from '@/types/content';

/**
 * Merge several sources into one feed, page by page, round-robin:
 * news, movie, post, news, movie, post... so no source dominates. Interleaving
 * per page (not over the whole list) keeps earlier cards in place when a
 * later page loads.
 */
export function interleavePages(sources: readonly (readonly FeedPage[])[]): ContentItem[] {
  const pageCount = Math.max(0, ...sources.map((pages) => pages.length));
  const result: ContentItem[] = [];
  const seen = new Set<string>();
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const lists = sources.map((pages) => pages[pageIndex]?.items ?? []);
    const longest = Math.max(0, ...lists.map((list) => list.length));
    for (let row = 0; row < longest; row += 1) {
      for (const list of lists) {
        const item = list[row];
        if (item && !seen.has(item.id)) {
          seen.add(item.id);
          result.push(item);
        }
      }
    }
  }
  return result;
}

/**
 * Apply the user's saved drag-and-drop order. Items in `order` come first in
 * that order; items the user has never moved (new stories) follow in their
 * natural order. Ids in `order` that are no longer loaded are skipped.
 */
export function applyOrder(items: readonly ContentItem[], order: readonly string[]): ContentItem[] {
  if (order.length === 0) return [...items];
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = order.flatMap((id) => byId.get(id) ?? []);
  const placed = new Set(order);
  return [...ordered, ...items.filter((item) => !placed.has(item.id))];
}
