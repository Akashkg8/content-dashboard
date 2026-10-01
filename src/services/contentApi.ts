import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { contentItemSchema } from '@/lib/schemas';
import type {
  Category,
  ContentItem,
  FeedPage,
  SearchResponse,
  TrendingCategory,
  TrendingResponse,
} from '@/types/content';

export interface NewsFeedArg {
  categories: Category[];
}
export interface MovieFeedArg {
  categories: Category[];
  /** Genres of favorited movies. Boosts matching recommendations. */
  historyGenres: number[];
}
export interface SocialFeedArg {
  categories: Category[];
  hashtags: string[];
}

export type LiveStatus = 'connecting' | 'live' | 'offline';
export interface LiveFeedState {
  status: LiveStatus;
  posts: ContentItem[];
}

export const MAX_LIVE_POSTS = 6;
export const STREAM_URL = '/api/stream';

/** Shared paging rule: ask for the next page while the server says there is more. */
const pagedOptions = {
  initialPageParam: 1,
  getNextPageParam: (lastPage: FeedPage, _all: FeedPage[], lastPageParam: number) =>
    lastPage.hasMore ? lastPageParam + 1 : undefined,
};

/**
 * One API for every content source. Components never call fetch directly:
 * RTK Query handles caching, request de-duplication, loading and error state.
 * Fetched content stays in this cache and is never copied into slices.
 */
export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    newsFeed: build.infiniteQuery<FeedPage, NewsFeedArg, number>({
      infiniteQueryOptions: pagedOptions,
      query: ({ queryArg, pageParam }) => ({
        url: 'news',
        params: { categories: queryArg.categories.join(','), page: pageParam },
      }),
    }),
    movieFeed: build.infiniteQuery<FeedPage, MovieFeedArg, number>({
      infiniteQueryOptions: pagedOptions,
      query: ({ queryArg, pageParam }) => ({
        url: 'movies',
        params: {
          categories: queryArg.categories.join(','),
          genres: queryArg.historyGenres.join(','),
          page: pageParam,
        },
      }),
    }),
    socialFeed: build.infiniteQuery<FeedPage, SocialFeedArg, number>({
      infiniteQueryOptions: pagedOptions,
      query: ({ queryArg, pageParam }) => ({
        url: 'social',
        params: {
          categories: queryArg.categories.join(','),
          hashtags: queryArg.hashtags.join(','),
          page: pageParam,
        },
      }),
    }),
    trending: build.query<TrendingResponse, TrendingCategory>({
      query: (category) => ({ url: 'trending', params: { category } }),
    }),
    search: build.query<SearchResponse, string>({
      query: (q) => ({ url: 'search', params: { q } }),
      keepUnusedDataFor: 120,
    }),
    /**
     * Real-time posts over Server-Sent Events. The query itself resolves
     * instantly with an empty list; `onCacheEntryAdded` then opens the stream
     * while any component is subscribed and closes it when the last one leaves.
     */
    liveFeed: build.query<LiveFeedState, void>({
      queryFn: () => ({ data: { status: 'connecting', posts: [] } }),
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        if (typeof EventSource === 'undefined') return;
        await cacheDataLoaded;
        const source = new EventSource(STREAM_URL);

        const setStatus = (status: LiveStatus) =>
          updateCachedData((draft) => {
            draft.status = status;
          });
        source.addEventListener('open', () => setStatus('live'));
        source.addEventListener('error', () =>
          setStatus(source.readyState === EventSource.CLOSED ? 'offline' : 'connecting'),
        );
        source.addEventListener('post', (event) => {
          let data: unknown;
          try {
            data = JSON.parse((event as MessageEvent<string>).data);
          } catch {
            return;
          }
          const parsed = contentItemSchema.safeParse(data);
          if (!parsed.success) return;
          const post = parsed.data;
          updateCachedData((draft) => {
            draft.status = 'live';
            if (draft.posts.some((existing) => existing.id === post.id)) return;
            draft.posts.unshift(post);
            draft.posts.splice(MAX_LIVE_POSTS);
          });
        });

        await cacheEntryRemoved;
        source.close();
      },
    }),
  }),
});

export const {
  useNewsFeedInfiniteQuery,
  useMovieFeedInfiniteQuery,
  useSocialFeedInfiniteQuery,
  useTrendingQuery,
  useSearchQuery,
  useLiveFeedQuery,
} = contentApi;
