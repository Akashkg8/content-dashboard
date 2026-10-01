import 'server-only';

import type { Category, ContentItem, TrendingCategory } from '@/types/content';

import { buildMockSocial } from '../mock/build';
import { PAGE_SIZE, paginate } from '../paging';
import { byNewest, byPopularity, matchesQuery, type SourceResult } from './types';

/**
 * Social posts come from a built-in mock network: real social APIs are closed
 * or paid, and the assignment allows a mock. It still behaves like an API,
 * filterable by category, hashtag and user, and paged.
 */
export function getSocialPage({
  categories,
  hashtags,
  user,
  page,
}: {
  categories: Category[];
  hashtags: string[];
  user?: string;
  page: number;
}): SourceResult {
  const followsTag = (post: ContentItem) =>
    (post.hashtags ?? []).some((tag) => hashtags.includes(tag));

  const items = buildMockSocial()
    .filter((post) =>
      user
        ? post.author.toLowerCase() === `@${user.toLowerCase()}`
        : categories.includes(post.category) || followsTag(post),
    )
    .sort(byNewest);
  return { ...paginate(items, page), origin: 'mock' };
}

export function getTrendingSocial(category: TrendingCategory): SourceResult {
  const items = buildMockSocial()
    .filter((post) => category === 'all' || post.category === category)
    .sort(byPopularity)
    .slice(0, PAGE_SIZE);
  return { items, hasMore: false, origin: 'mock' };
}

/** `#tag` searches hashtags, `@name` searches handles, anything else searches the text. */
export function searchSocial(query: string): SourceResult {
  const term = query.trim().toLowerCase();
  const items = buildMockSocial().filter((post) => {
    if (term.startsWith('#')) return (post.hashtags ?? []).includes(term.slice(1));
    if (term.startsWith('@')) return post.author.toLowerCase().startsWith(term);
    return matchesQuery(term, post.title, post.description, post.author, ...(post.hashtags ?? []));
  });
  return { items: items.slice(0, 12), hasMore: false, origin: 'mock' };
}
