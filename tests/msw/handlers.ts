import { http, HttpResponse } from 'msw';

import type { ContentSource, SearchResponse, TrendingResponse } from '@/types/content';

import { makeContentItem, makeFeedPage } from '../fixtures/content';

const pageOf = (request: Request) => Number(new URL(request.url).searchParams.get('page') ?? '1');

/** Two pages per source by default, so "load more" has something to load. */
const feedHandler = (path: string, source: ContentSource) =>
  http.get(`*/api/${path}`, ({ request }) => {
    const page = pageOf(request);
    return HttpResponse.json(makeFeedPage(source, { page, hasMore: page < 2 }));
  });

const items = (source: ContentSource, count: number, extra = '') =>
  Array.from({ length: count }, (_, index) =>
    makeContentItem({
      source,
      title: `${source} ${extra}${index + 1}`,
      popularity: 90 - index * 10,
    }),
  );

/**
 * Default happy-path handlers for our own BFF routes. Tests never hit NewsAPI or
 * TMDB directly: the browser only talks to `/api/*`, so that is what we mock.
 * Override per test with `server.use(...)` for empty and error states.
 */
export const handlers = [
  feedHandler('news', 'news'),
  feedHandler('movies', 'movie'),
  feedHandler('social', 'social'),
  http.get('*/api/search', ({ request }) => {
    const query = new URL(request.url).searchParams.get('q') ?? '';
    return HttpResponse.json<SearchResponse>({
      query,
      news: items('news', 2, `${query} `),
      movies: items('movie', 1, `${query} `),
      social: items('social', 1, `${query} `),
      origins: { news: 'mock', movie: 'live', social: 'mock' },
    });
  }),
  http.get('*/api/trending', ({ request }) => {
    const category = (new URL(request.url).searchParams.get('category') ??
      'all') as TrendingResponse['category'];
    return HttpResponse.json<TrendingResponse>({
      category,
      news: items('news', 5, `${category} `),
      movies: items('movie', 3, `${category} `),
      social: items('social', 3, `${category} `),
      origins: { news: 'live', movie: 'live', social: 'mock' },
    });
  }),
];
