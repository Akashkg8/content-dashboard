'use client';

import { skipToken } from '@reduxjs/toolkit/query';
import { useMemo } from 'react';

import { selectHistoryGenres } from '@/features/favorites/selectors';
import {
  useMovieFeedInfiniteQuery,
  useNewsFeedInfiniteQuery,
  useSocialFeedInfiniteQuery,
} from '@/services/contentApi';
import { useAppSelector } from '@/store/hooks';
import { useStoreHydrated } from '@/store/useStoreHydrated';
import type { ContentSource, FeedPage } from '@/types/content';

import { applyOrder, interleavePages } from '../selectors';

const NO_PAGES: FeedPage[] = [];

/**
 * The personalized feed: three sources fetched in parallel from the user's
 * preferences, merged round-robin, then arranged in the user's saved order.
 * Each source pages on its own; "load more" asks every source that has more.
 */
export function useUnifiedFeed() {
  const { categories, sources, hashtags } = useAppSelector((state) => state.preferences);
  const historyGenres = useAppSelector(selectHistoryGenres);
  const order = useAppSelector((state) => state.feed.order);
  // Wait for saved preferences before fetching, so we never fetch the defaults first.
  const hydrated = useStoreHydrated();
  const enabled = (source: ContentSource) => hydrated && sources.includes(source);

  const news = useNewsFeedInfiniteQuery(enabled('news') ? { categories } : skipToken);
  const movies = useMovieFeedInfiniteQuery(
    enabled('movie') ? { categories, historyGenres } : skipToken,
  );
  const social = useSocialFeedInfiniteQuery(
    enabled('social') ? { categories, hashtags } : skipToken,
  );

  const queries = [
    { source: 'news' as const, query: news },
    { source: 'movie' as const, query: movies },
    { source: 'social' as const, query: social },
  ].filter(({ source }) => enabled(source));

  const newsPages = enabled('news') ? (news.data?.pages ?? NO_PAGES) : null;
  const moviePages = enabled('movie') ? (movies.data?.pages ?? NO_PAGES) : null;
  const socialPages = enabled('social') ? (social.data?.pages ?? NO_PAGES) : null;

  const { items, origins } = useMemo(() => {
    const pages = [newsPages, moviePages, socialPages].filter((list) => list !== null);
    return {
      items: applyOrder(interleavePages(pages), order),
      origins: pages.flat().map((page) => page.origins),
    };
  }, [newsPages, moviePages, socialPages, order]);

  const loadMore = () => {
    for (const { query } of queries) {
      if (query.hasNextPage && !query.isFetching) void query.fetchNextPage();
    }
  };

  const retry = () => {
    for (const { query } of queries) if (query.isError) void query.refetch();
  };

  return {
    items,
    origins,
    enabledSources: queries.map(({ source }) => source),
    failedSources: queries.filter(({ query }) => query.isError).map(({ source }) => source),
    isLoading: !hydrated || (items.length === 0 && queries.some(({ query }) => query.isLoading)),
    isError: queries.length > 0 && queries.every(({ query }) => query.isError),
    hasMore: queries.some(({ query }) => query.hasNextPage),
    isFetchingMore: queries.some(({ query }) => query.isFetchingNextPage),
    loadMore,
    retry,
  };
}
