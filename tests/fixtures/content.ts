import type { ContentItem, ContentSource, FeedPage } from '@/types/content';

const CTA: Record<ContentSource, ContentItem['ctaLabel']> = {
  news: 'Read More',
  movie: 'Play Now',
  social: 'View Post',
};

let counter = 0;

/** Build a valid `ContentItem`. Override only the fields a test cares about. */
export function makeContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  counter += 1;
  const source = overrides.source ?? 'news';
  return {
    id: `${source}:test-${counter}`,
    source,
    category: 'technology',
    title: `Test ${source} item ${counter}`,
    description: `Description for test ${source} item ${counter}.`,
    imageUrl: null,
    url: `https://example.com/${source}/${counter}`,
    ctaLabel: CTA[source],
    publishedAt: '2026-01-01T00:00:00.000Z',
    author: 'Test Author',
    popularity: 50,
    ...overrides,
  };
}

/** Build one page of a single-source feed response. */
export function makeFeedPage(
  source: ContentSource,
  {
    count = 3,
    page = 1,
    hasMore = false,
  }: { count?: number; page?: number; hasMore?: boolean } = {},
): FeedPage {
  return {
    items: Array.from({ length: count }, () => makeContentItem({ source })),
    page,
    hasMore,
    origins: { [source]: 'mock' },
  };
}
