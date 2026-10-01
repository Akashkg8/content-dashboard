import 'server-only';

import { z } from 'zod';

import { shortHash } from '@/lib/hash';
import type { Category, ContentItem } from '@/types/content';

import { fetchProviderJson, httpsOrNull } from '../http';

const BASE_URL = 'https://newsapi.org/v2';

const articleSchema = z.object({
  source: z.object({
    id: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
  }),
  author: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  urlToImage: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
});

export const newsApiResponseSchema = z.object({
  status: z.literal('ok'),
  totalResults: z.number(),
  articles: z.array(articleSchema),
});

export type NewsApiArticle = z.infer<typeof articleSchema>;
export type NewsApiResponse = z.infer<typeof newsApiResponseSchema>;

/**
 * Normalize one NewsAPI article. Returns null for articles we cannot show:
 * removed stories, missing titles, or non-https links.
 */
export function adaptArticle(
  article: NewsApiArticle,
  category: Category,
  rank: number,
): ContentItem | null {
  const title = article.title?.trim();
  const url = httpsOrNull(article.url);
  if (!title || title === '[Removed]' || !url) return null;
  return {
    id: `news:${shortHash(url)}`,
    source: 'news',
    category,
    // NewsAPI appends " - Publisher" to headlines. The publisher is shown separately.
    title: title.replace(/\s+-\s+[^-]+$/, '') || title,
    description: article.description?.trim() || 'Open the story to read more.',
    imageUrl: httpsOrNull(article.urlToImage),
    url,
    ctaLabel: 'Read More',
    publishedAt: article.publishedAt ?? new Date().toISOString(),
    author: article.source.name?.trim() || article.author?.trim() || 'Unknown source',
    popularity: Math.max(1, 100 - rank * 3),
  };
}

/** `category` may be a function for results that span categories, such as search. */
export function adaptArticles(
  response: NewsApiResponse,
  category: Category | ((article: NewsApiArticle) => Category),
): ContentItem[] {
  const items = response.articles.flatMap(
    (article, rank) =>
      adaptArticle(article, typeof category === 'function' ? category(article) : category, rank) ??
      [],
  );
  // The same story can be syndicated twice with the same URL.
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

export function fetchTopHeadlines(
  apiKey: string,
  { category, page, pageSize }: { category?: Category; page: number; pageSize: number },
) {
  const url = new URL(`${BASE_URL}/top-headlines`);
  url.search = new URLSearchParams({
    country: 'us',
    ...(category ? { category } : {}),
    page: String(page),
    pageSize: String(pageSize),
  }).toString();
  return fetchProviderJson(url, newsApiResponseSchema, { 'X-Api-Key': apiKey });
}

export function fetchEverything(
  apiKey: string,
  { query, pageSize }: { query: string; pageSize: number },
) {
  const url = new URL(`${BASE_URL}/everything`);
  url.search = new URLSearchParams({
    q: query,
    searchIn: 'title,description',
    language: 'en',
    sortBy: 'relevancy',
    pageSize: String(pageSize),
  }).toString();
  return fetchProviderJson(url, newsApiResponseSchema, { 'X-Api-Key': apiKey });
}
