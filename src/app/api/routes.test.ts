/** @jest-environment node */
import { http, HttpResponse } from 'msw';
import { NextRequest } from 'next/server';

import type { FeedPage, SearchResponse, TrendingResponse } from '@/types/content';

import { GET as getMovies } from './movies/route';
import { GET as getNews } from './news/route';
import { GET as getSearch } from './search/route';
import { GET as getSocial } from './social/route';
import { GET as getTrending } from './trending/route';
import { server } from '../../../tests/msw/server';


const request = (path: string) => new NextRequest(new URL(path, 'http://localhost'));
const json = async <T>(response: Response) => (await response.json()) as T;

const ENV = { ...process.env };
beforeEach(() => {
  process.env = { ...ENV, NEWS_API_KEY: '', TMDB_API_KEY: '', USE_MOCK_DATA: 'false' };
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  process.env = ENV;
  jest.restoreAllMocks();
});

describe('/api/news', () => {
  it('serves paged mock headlines for the chosen categories when no key is set', async () => {
    const response = await getNews(request('/api/news?categories=sports,science&page=1'));
    const body = await json<FeedPage>(response);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('s-maxage=300');
    expect(body.origins).toEqual({ news: 'mock' });
    expect(body.items).toHaveLength(9);
    expect(body.hasMore).toBe(true);
    expect(new Set(body.items.map((item) => item.category))).toEqual(
      new Set(['sports', 'science']),
    );
  });

  it('uses NewsAPI when a key is set, sending the key in a header', async () => {
    process.env.NEWS_API_KEY = 'test-key';
    let sentKey: string | null = null;
    server.use(
      http.get('https://newsapi.org/v2/top-headlines', ({ request: req }) => {
        sentKey = req.headers.get('x-api-key');
        return HttpResponse.json({
          status: 'ok',
          totalResults: 1,
          articles: [
            {
              source: { name: 'Reuters' },
              title: 'Live headline',
              url: 'https://reuters.com/a',
              publishedAt: '2026-01-01T00:00:00Z',
            },
          ],
        });
      }),
    );

    const body = await json<FeedPage>(await getNews(request('/api/news?categories=business')));

    expect(sentKey).toBe('test-key');
    expect(body.origins).toEqual({ news: 'live' });
    expect(body.items.map((item) => item.title)).toEqual(['Live headline']);
  });

  it('falls back to mock data when NewsAPI fails or rate-limits', async () => {
    process.env.NEWS_API_KEY = 'test-key';
    server.use(
      http.get('https://newsapi.org/v2/top-headlines', () =>
        HttpResponse.json({ status: 'error', code: 'rateLimited' }, { status: 429 }),
      ),
    );
    const body = await json<FeedPage>(await getNews(request('/api/news')));
    expect(body.origins).toEqual({ news: 'mock' });
    expect(body.items.length).toBeGreaterThan(0);
  });

  it('honours USE_MOCK_DATA even with a key', async () => {
    process.env.NEWS_API_KEY = 'test-key';
    process.env.USE_MOCK_DATA = 'true';
    const body = await json<FeedPage>(await getNews(request('/api/news')));
    expect(body.origins.news).toBe('mock');
  });

  it.each(['/api/news?page=0', '/api/news?page=abc', '/api/news?categories=politics'])(
    'rejects invalid input: %s',
    async (path) => {
      expect((await getNews(request(path))).status).toBe(400);
    },
  );
});

describe('/api/movies', () => {
  it('boosts movies matching favorite genres', async () => {
    const plain = await json<FeedPage>(await getMovies(request('/api/movies?categories=sports')));
    const boosted = await json<FeedPage>(
      await getMovies(request('/api/movies?categories=sports&genres=99')),
    );
    // Documentaries (genre 99) do not match the sports genres, so only history can bring them in.
    const hasDocumentary = (body: FeedPage) =>
      body.items.some((item) => item.genreIds?.includes(99));
    expect(hasDocumentary(plain)).toBe(false);
    expect(hasDocumentary(boosted)).toBe(true);
  });

  it('calls TMDB discover with OR-joined genres when a key is set', async () => {
    process.env.TMDB_API_KEY = 'tmdb-key';
    let url: URL | undefined;
    server.use(
      http.get('https://api.themoviedb.org/3/discover/movie', ({ request: req }) => {
        url = new URL(req.url);
        return HttpResponse.json({
          page: 1,
          total_pages: 3,
          results: [{ id: 7, title: 'Live movie', genre_ids: [99] }],
        });
      }),
    );
    const body = await json<FeedPage>(
      await getMovies(request('/api/movies?categories=science&genres=18')),
    );
    expect(url?.searchParams.get('with_genres')).toBe('18|99|878');
    expect(url?.searchParams.get('api_key')).toBe('tmdb-key');
    expect(body).toMatchObject({ hasMore: true, origins: { movie: 'live' } });
  });
});

describe('/api/social', () => {
  it('includes posts from followed hashtags outside the chosen categories', async () => {
    const body = await json<FeedPage>(
      await getSocial(request('/api/social?categories=sports&hashtags=space')),
    );
    const categories = new Set(body.items.map((item) => item.category));
    expect(categories).toEqual(new Set(['sports', 'science']));
  });

  it('filters by user', async () => {
    const body = await json<FeedPage>(await getSocial(request('/api/social?user=devdiaries')));
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((item) => item.author === '@devdiaries')).toBe(true);
  });
});

describe('/api/trending and /api/search', () => {
  it('returns each source sorted by popularity', async () => {
    const body = await json<TrendingResponse>(
      await getTrending(request('/api/trending?category=science')),
    );
    for (const list of [body.news, body.movies, body.social]) {
      const scores = list.map((item) => item.popularity);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    }
  });

  it('searches across sources', async () => {
    const body = await json<SearchResponse>(await getSearch(request('/api/search?q=space')));
    expect(body.news.length + body.movies.length + body.social.length).toBeGreaterThan(0);
    expect((await getSearch(request('/api/search?q=a'))).status).toBe(400);
  });

  it('finds social posts by #hashtag and @handle', async () => {
    const tags = await json<SearchResponse>(await getSearch(request('/api/search?q=%23cricket')));
    expect(tags.social.every((post) => post.hashtags?.includes('cricket'))).toBe(true);
    const users = await json<SearchResponse>(
      await getSearch(request('/api/search?q=@frontendfox')),
    );
    expect(users.social.map((post) => post.author)).toEqual(['@frontendfox']);
  });
});
