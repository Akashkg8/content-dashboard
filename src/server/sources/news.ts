import 'server-only';

import type { Category, TrendingCategory } from '@/types/content';

import { guessCategory } from '../classify';
import { getServerEnv } from '../env';
import { logFallback } from '../http';
import { byNewest, byPopularity, matchesQuery, type SourceResult } from './types';
import { buildMockNews } from '../mock/build';
import { MAX_PAGE, PAGE_SIZE, paginate } from '../paging';
import { adaptArticles, fetchEverything, fetchTopHeadlines } from '../providers/newsapi';

function newsApiKey(): string | undefined {
  const env = getServerEnv();
  return env.USE_MOCK_DATA ? undefined : env.NEWS_API_KEY;
}

/** One feed page of headlines across the chosen categories, newest first. */
export async function getNewsPage(categories: Category[], page: number): Promise<SourceResult> {
  const apiKey = newsApiKey();
  if (apiKey) {
    try {
      // NewsAPI takes one category per request, so each category fills its share of the page.
      const perCategory = Math.max(3, Math.ceil(PAGE_SIZE / categories.length));
      const responses = await Promise.all(
        categories.map((category) =>
          fetchTopHeadlines(apiKey, { category, page, pageSize: perCategory }),
        ),
      );
      const items = responses.flatMap((response, index) =>
        adaptArticles(response, categories[index]!),
      );
      const hasMore =
        page < MAX_PAGE && responses.some((response) => page * perCategory < response.totalResults);
      return { items: dedupe(items).sort(byNewest), hasMore, origin: 'live' };
    } catch (error) {
      logFallback('news', error);
    }
  }
  const items = buildMockNews()
    .filter((item) => categories.includes(item.category))
    .sort(byNewest);
  return { ...paginate(items, page), origin: 'mock' };
}

export async function getTopNews(category: TrendingCategory): Promise<SourceResult> {
  const apiKey = newsApiKey();
  if (apiKey) {
    try {
      const response = await fetchTopHeadlines(apiKey, {
        category: category === 'all' ? undefined : category,
        page: 1,
        pageSize: PAGE_SIZE,
      });
      const items = adaptArticles(response, (article) =>
        category === 'all' ? guessCategory(`${article.title} ${article.description}`) : category,
      );
      return { items, hasMore: false, origin: 'live' };
    } catch (error) {
      logFallback('news', error);
    }
  }
  const items = buildMockNews()
    .filter((item) => category === 'all' || item.category === category)
    .sort(byPopularity)
    .slice(0, PAGE_SIZE);
  return { items, hasMore: false, origin: 'mock' };
}

export async function searchNews(query: string): Promise<SourceResult> {
  const apiKey = newsApiKey();
  if (apiKey) {
    try {
      const response = await fetchEverything(apiKey, { query, pageSize: 12 });
      const items = adaptArticles(response, (article) =>
        guessCategory(`${article.title} ${article.description}`),
      );
      return { items, hasMore: false, origin: 'live' };
    } catch (error) {
      logFallback('news', error);
    }
  }
  const items = buildMockNews().filter((item) =>
    matchesQuery(query, item.title, item.description, item.author, item.category),
  );
  return { items: items.slice(0, 12), hasMore: false, origin: 'mock' };
}

function dedupe<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}
