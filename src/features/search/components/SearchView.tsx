'use client';

import { skipToken } from '@reduxjs/toolkit/query';
import { Search, SearchX } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';

import { CardGridSkeleton } from '@/components/content/CardGridSkeleton';
import { ContentGrid } from '@/components/content/ContentGrid';
import { DataOriginBadge } from '@/components/content/DataOriginBadge';
import { SOURCE_META } from '@/components/content/sourceStyles';
import { ChipGroup, type ChipOption } from '@/components/ui/ChipGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { useSearchQuery } from '@/services/contentApi';
import type { ContentItem, ContentSource } from '@/types/content';

import { MIN_QUERY_LENGTH, SearchBar, SearchBarFallback } from './SearchBar';

const SUGGESTIONS = ['space', 'Interstellar', '#cricket', '@frontendfox', 'markets'];

type Filter = 'all' | ContentSource;

export function SearchView({ query }: { query: string }) {
  const [filter, setFilter] = useState<Filter>('all');
  // A new search starts on "All" again.
  const [filterQuery, setFilterQuery] = useState(query);
  if (filterQuery !== query) {
    setFilterQuery(query);
    setFilter('all');
  }

  const ready = query.length >= MIN_QUERY_LENGTH;
  const { data, currentData, isFetching, isError, refetch } = useSearchQuery(
    ready ? query : skipToken,
  );
  // While the next query loads, keep the previous results on screen, dimmed, instead of flashing a skeleton.
  const shown = currentData ?? (ready && isFetching ? data : undefined);
  const stale = Boolean(shown && shown.query !== query);

  const bySource: Record<ContentSource, ContentItem[]> = {
    news: shown?.news ?? [],
    movie: shown?.movies ?? [],
    social: shown?.social ?? [],
  };
  const total = bySource.news.length + bySource.movie.length + bySource.social.length;
  // Round-robin, like the feed, so the "all" view mixes sources.
  const all = Array.from({ length: Math.max(...Object.values(bySource).map((l) => l.length)) })
    .flatMap((_, index) => [bySource.news[index], bySource.movie[index], bySource.social[index]])
    .filter((item): item is ContentItem => Boolean(item));
  const visible = filter === 'all' ? all : bySource[filter];

  const options: ChipOption<Filter>[] = [
    { value: 'all', label: 'All', count: total },
    ...(['news', 'movie', 'social'] as const).map((source) => ({
      value: source,
      label: SOURCE_META[source].plural,
      count: bySource[source].length,
    })),
  ];

  return (
    <>
      <PageHeader
        kicker="Search"
        title={ready ? `Results for “${query}”` : 'Search everything'}
        description="One search across news, movies and posts. Try #hashtags and @handles for posts."
        actions={shown ? <DataOriginBadge origins={[shown.origins]} /> : null}
      />

      {/* The header search box is hidden on phones, so the page carries its own. */}
      <div className="mb-6 sm:hidden">
        <Suspense fallback={<SearchBarFallback />}>
          <SearchBar inputId="page-search" />
        </Suspense>
      </div>

      {/* Announce result counts to screen readers as the user types. */}
      <p role="status" aria-live="polite" className="sr-only">
        {ready && currentData ? `${total} results for ${query}` : ''}
      </p>

      {!ready ? (
        <EmptyState
          icon={<Search className="size-6" />}
          title="What are you looking for?"
          description={
            <>
              Type at least {MIN_QUERY_LENGTH} characters in the search box, or press{' '}
              <kbd className="border-line-strong rounded border px-1 font-mono text-xs">/</kbd> to
              jump there. Some ideas:
            </>
          }
          action={<Suggestions />}
        />
      ) : isError ? (
        <ErrorState
          title="Search is not responding"
          message="We could not complete this search. Try again in a moment."
          onRetry={() => void refetch()}
        />
      ) : !shown || (stale && total === 0) ? (
        // Nothing useful to keep on screen while the new query loads.
        <div className="space-y-6">
          <Spinner label={`Searching for ${query}`} />
          <CardGridSkeleton count={3} />
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title={`No results for “${query}”`}
          description="Check the spelling, use fewer words, or try one of these:"
          action={<Suggestions />}
        />
      ) : (
        <div aria-busy={stale} className={stale ? 'opacity-60 transition-opacity' : undefined}>
          <ChipGroup
            label="Filter results by source"
            options={options}
            value={filter}
            onChange={setFilter}
            className="mb-6"
          />
          {visible.length ? (
            <ContentGrid items={visible} label={`Search results for ${query}`} />
          ) : (
            <p className="text-ink-muted">
              {filter === 'all'
                ? 'No results match this search.'
                : `No ${SOURCE_META[filter].plural.toLowerCase()} match this search.`}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function Suggestions() {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {SUGGESTIONS.map((suggestion) => (
        <li key={suggestion}>
          <Link
            href={`/search?q=${encodeURIComponent(suggestion)}`}
            className="border-line-strong hover:border-ink inline-flex h-9 items-center rounded-full border px-3.5 font-mono text-sm"
          >
            {suggestion}
          </Link>
        </li>
      ))}
    </ul>
  );
}
