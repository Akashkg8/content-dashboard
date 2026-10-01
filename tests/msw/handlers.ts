import { http, HttpResponse } from 'msw';

import { makeFeedPage } from '../fixtures/content';

/**
 * Default happy-path handlers for our own BFF routes. Tests never hit NewsAPI or
 * TMDB directly: the browser only talks to `/api/*`, so that is what we mock.
 * Override per test with `server.use(...)` for empty and error states.
 */
export const handlers = [
  http.get('*/api/news', ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get('page') ?? '1');
    return HttpResponse.json(makeFeedPage('news', { page, hasMore: page < 2 }));
  }),
  http.get('*/api/movies', ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get('page') ?? '1');
    return HttpResponse.json(makeFeedPage('movie', { page, hasMore: page < 2 }));
  }),
  http.get('*/api/social', ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get('page') ?? '1');
    return HttpResponse.json(makeFeedPage('social', { page, hasMore: page < 2 }));
  }),
];
