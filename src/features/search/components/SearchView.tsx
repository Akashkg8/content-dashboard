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
import { useT } from '@/i18n/useT';
import { useSearchQuery } from '@/services/contentApi';
import type { ContentItem, ContentSource } from '@/types/content';

import { MIN_QUERY_LENGTH, SearchBar, SearchBarFallback } from './SearchBar';

const SUGGESTIONS = ['space', 'Interstellar', '#cricket', '@frontendfox', 'markets'];

type Filter = 'all' | ContentSource;

export function SearchView({ query }: { query: string }) {
  const { t, language } = useT();
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
    { value: 'all', label: t('search.all'), count: total },
    ...(['news', 'movie', 'social'] as const).map((source) => ({
      value: source,
      label: t(SOURCE_META[source].pluralKey),
      count: bySource[source].length,
    })),
  ];

  return (
    <>
      <PageHeader
        kicker={t('search.kicker')}
        title={ready ? t('search.titleResults', { query }) : t('search.titleEmpty')}
        description={t('search.description')}
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
        {ready && currentData ? t('search.resultsCount', { count: total, query }) : ''}
      </p>

      {!ready ? (
        <EmptyState
          icon={<Search className="size-6" />}
          title={t('search.promptTitle')}
          description={
            <>
              {t('search.promptBefore', { min: MIN_QUERY_LENGTH })}{' '}
              <kbd className="border-line-strong rounded border px-1 font-mono text-xs">/</kbd>{' '}
              {t('search.promptAfter')}
            </>
          }
          action={<Suggestions />}
        />
      ) : isError ? (
        <ErrorState
          title={t('search.errorTitle')}
          message={t('search.errorMessage')}
          onRetry={() => void refetch()}
        />
      ) : !shown || (stale && total === 0) ? (
        // Nothing useful to keep on screen while the new query loads.
        <div className="space-y-6">
          <Spinner label={t('search.searching', { query })} />
          <CardGridSkeleton count={3} />
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title={t('search.noResultsTitle', { query })}
          description={t('search.noResultsDescription')}
          action={<Suggestions />}
        />
      ) : (
        <div aria-busy={stale} className={stale ? 'opacity-60 transition-opacity' : undefined}>
          <ChipGroup
            label={t('search.filterLabel')}
            options={options}
            value={filter}
            onChange={setFilter}
            className="mb-6"
          />
          {visible.length ? (
            <ContentGrid items={visible} label={t('search.listLabel', { query })} />
          ) : (
            <p className="text-ink-muted">
              {filter === 'all'
                ? t('search.noneAll')
                : t('search.noneSource', {
                    source: t(SOURCE_META[filter].pluralKey).toLocaleLowerCase(language),
                  })}
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
