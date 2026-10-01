/** @jest-environment node */
import { adaptArticle, adaptArticles, newsApiResponseSchema } from './newsapi';
import { adaptMovie, tmdbListSchema } from './tmdb';

describe('NewsAPI adapter', () => {
  const article = {
    source: { id: null, name: 'The Verge' },
    author: 'Jane Doe',
    title: 'New chip ships - The Verge',
    description: 'Faster and cooler.',
    url: 'https://www.theverge.com/chip',
    urlToImage: 'http://cdn.example.com/chip.jpg',
    publishedAt: '2026-01-01T10:00:00Z',
  };

  it('normalizes a good article', () => {
    const item = adaptArticle(article, 'technology', 0)!;
    expect(item).toMatchObject({
      source: 'news',
      category: 'technology',
      title: 'New chip ships',
      author: 'The Verge',
      url: 'https://www.theverge.com/chip',
      imageUrl: 'https://cdn.example.com/chip.jpg',
      ctaLabel: 'Read More',
    });
    expect(item.id).toMatch(/^news:[a-z0-9]+$/);
  });

  it.each([
    ['removed stories', { title: '[Removed]' }],
    ['missing titles', { title: null }],
    ['unsafe links', { url: 'javascript:alert(1)' }],
    ['missing links', { url: undefined }],
  ])('drops %s', (_label, patch) => {
    expect(adaptArticle({ ...article, ...patch }, 'technology', 0)).toBeNull();
  });

  it('fills gaps instead of failing on sparse data', () => {
    const item = adaptArticle(
      {
        source: {},
        title: 'Only a title',
        url: 'https://x.test/a',
        description: '',
        urlToImage: 'not a url',
      },
      'science',
      2,
    )!;
    expect(item.description).toBe('Open the story to read more.');
    expect(item.author).toBe('Unknown source');
    expect(item.imageUrl).toBeNull();
  });

  it('de-duplicates syndicated copies and rejects a wrong top-level shape', () => {
    const response = newsApiResponseSchema.parse({
      status: 'ok',
      totalResults: 2,
      articles: [article, article],
    });
    expect(adaptArticles(response, 'technology')).toHaveLength(1);
    expect(
      newsApiResponseSchema.safeParse({ status: 'error', message: 'rate limited' }).success,
    ).toBe(false);
  });
});

describe('TMDB adapter', () => {
  it('normalizes a movie and infers its category from genres', () => {
    const item = adaptMovie(
      {
        id: 157336,
        title: 'Interstellar',
        overview: 'Wormhole.',
        backdrop_path: '/b.jpg',
        release_date: '2014-11-05',
        vote_average: 8.43,
        genre_ids: [878, 18, 12],
      },
      'entertainment',
    )!;
    expect(item).toMatchObject({
      id: 'movie:157336',
      category: 'technology',
      imageUrl: 'https://image.tmdb.org/t/p/w780/b.jpg',
      url: 'https://www.themoviedb.org/movie/157336',
      author: '8.4 / 10 · 2014',
      popularity: 84,
      ctaLabel: 'Play Now',
    });
  });

  it('copes with missing fields and drops untitled entries', () => {
    expect(adaptMovie({ id: 1, title: null }, 'sports')).toBeNull();
    const sparse = adaptMovie({ id: 2, title: 'Mystery' }, 'sports')!;
    expect(sparse).toMatchObject({ category: 'sports', imageUrl: null, author: 'TMDB' });
    expect(tmdbListSchema.safeParse({ results: 'nope' }).success).toBe(false);
  });
});
