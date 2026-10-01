import 'server-only';

import { categoryForGenres } from '@/lib/genres';
import { CATEGORIES, type Category, type ContentItem } from '@/types/content';

import { MOVIE_SEEDS } from './movies';
import { NEWS_SEEDS } from './news';
import { LIVE_POST_TEMPLATES, SOCIAL_SEEDS } from './social';

const MINUTE = 60_000;

/** Stable, URL-safe id fragment from any title. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Royalty-free placeholder photo, the same one every time for a given seed. */
const photo = (seed: string) => `https://picsum.photos/seed/${seed}/800/450`;

/** Timestamps are relative to the current hour, so demo items always look recent. */
const currentHour = () => Math.floor(Date.now() / (60 * MINUTE)) * 60 * MINUTE;

export function buildMockNews(): ContentItem[] {
  const base = currentHour();
  return CATEGORIES.flatMap((category, categoryIndex) =>
    NEWS_SEEDS[category].map(([title, description, publisher], index): ContentItem => {
      const slug = slugify(title);
      return {
        id: `news:mock-${slug}`,
        source: 'news',
        category,
        title,
        description,
        imageUrl: photo(slug),
        url: `https://news.google.com/search?q=${encodeURIComponent(title)}`,
        ctaLabel: 'Read More',
        publishedAt: new Date(base - (index * 97 + categoryIndex * 13) * MINUTE).toISOString(),
        author: publisher,
        popularity: 100 - index * 6 - categoryIndex,
      };
    }),
  );
}

export function buildMockMovies(): ContentItem[] {
  return MOVIE_SEEDS.map(([title, overview, year, rating, genres]): ContentItem => {
    const slug = slugify(title);
    return {
      id: `movie:mock-${slug}`,
      source: 'movie',
      category: categoryForGenres(genres, 'entertainment'),
      title,
      description: overview,
      imageUrl: photo(`film-${slug}`),
      url: `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`,
      ctaLabel: 'Play Now',
      publishedAt: `${year}-01-01T00:00:00.000Z`,
      author: `Rated ${rating.toFixed(1)} · ${year}`,
      popularity: Math.round(rating * 10),
      genreIds: [...genres],
    };
  });
}

export function buildMockSocial(): ContentItem[] {
  const base = currentHour();
  return SOCIAL_SEEDS.map((post, index): ContentItem => {
    const slug = `${post.user}-${index}`;
    return {
      id: `social:mock-${slug}`,
      source: 'social',
      category: post.category,
      title: post.displayName,
      description: post.text,
      imageUrl: post.withImage ? photo(`post-${slug}`) : null,
      url: `https://x.com/hashtag/${post.hashtags[0] ?? post.category}`,
      ctaLabel: 'View Post',
      publishedAt: new Date(base - index * 41 * MINUTE).toISOString(),
      author: `@${post.user}`,
      popularity: Math.min(100, Math.round(post.likes / 100)),
      hashtags: [...post.hashtags],
    };
  });
}

/** A brand-new post for the real-time stream. `sequence` keeps ids unique. */
export function buildLivePost(sequence: number, now = Date.now()): ContentItem {
  const template = LIVE_POST_TEMPLATES[sequence % LIVE_POST_TEMPLATES.length]!;
  return {
    id: `social:live-${now}-${sequence}`,
    source: 'social',
    category: template.category as Category,
    title: template.displayName,
    description: template.text,
    imageUrl: null,
    url: `https://x.com/hashtag/${template.hashtags[0] ?? template.category}`,
    ctaLabel: 'View Post',
    publishedAt: new Date(now).toISOString(),
    author: `@${template.user}`,
    popularity: 50,
    hashtags: [...template.hashtags],
  };
}
