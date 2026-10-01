'use client';

import { Newspaper, RotateCcw, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { CardGridSkeleton } from '@/components/content/CardGridSkeleton';
import { DataOriginBadge } from '@/components/content/DataOriginBadge';
import { LoadMore } from '@/components/content/LoadMore';
import { SortableGrid } from '@/components/content/SortableGrid';
import { SOURCE_META } from '@/components/content/sourceStyles';
import { Button, buttonClasses } from '@/components/ui/Button';
import { ChipGroup, type ChipOption } from '@/components/ui/ChipGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { ContentSource } from '@/types/content';

import { reorderFeed, resetFeedOrder } from '../feedSlice';
import { LiveBadge, LiveStrip } from './LiveFeed';
import { useUnifiedFeed } from '../hooks/useUnifiedFeed';

type Filter = 'all' | ContentSource;

export function FeedView() {
  const dispatch = useAppDispatch();
  const feed = useUnifiedFeed();
  const hasCustomOrder = useAppSelector((state) => state.feed.order.length > 0);
  const [filter, setFilter] = useState<Filter>('all');

  // A source can be switched off in settings while it is the active filter.
  const activeFilter = filter === 'all' || feed.enabledSources.includes(filter) ? filter : 'all';
  const visible =
    activeFilter === 'all' ? feed.items : feed.items.filter((item) => item.source === activeFilter);

  const filterOptions: ChipOption<Filter>[] = [
    { value: 'all', label: 'Everything', count: feed.items.length },
    ...feed.enabledSources.map((source) => {
      const meta = SOURCE_META[source];
      return {
        value: source,
        label: meta.plural,
        icon: <meta.icon aria-hidden="true" className="size-3.5" />,
        count: feed.items.filter((item) => item.source === source).length,
      };
    }),
  ];

  return (
    <>
      <PageHeader
        kicker="Today's edition"
        title="Your feed"
        description="Headlines, movie picks and posts from the topics you follow. Drag the grip on any card to rearrange your edition."
        actions={
          <>
            <DataOriginBadge origins={feed.origins} />
            {feed.enabledSources.includes('social') ? <LiveBadge /> : null}
          </>
        }
      />

      {feed.enabledSources.includes('social') ? <LiveStrip /> : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <ChipGroup
          label="Filter by source"
          options={filterOptions}
          value={activeFilter}
          onChange={setFilter}
        />
        <div className="flex items-center gap-2">
          {hasCustomOrder ? (
            <Button variant="ghost" size="sm" onClick={() => dispatch(resetFeedOrder())}>
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Reset order
            </Button>
          ) : null}
          <Link href="/settings" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
            <SlidersHorizontal aria-hidden="true" className="size-3.5" />
            Personalize
          </Link>
        </div>
      </div>

      {feed.failedSources.length > 0 && !feed.isError ? (
        <div
          role="alert"
          className="border-danger/40 bg-surface mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
        >
          <span>
            {feed.failedSources.map((source) => SOURCE_META[source].plural).join(' and ')} could not
            load. The rest of your feed is below.
          </span>
          <Button size="sm" variant="secondary" onClick={feed.retry}>
            Try again
          </Button>
        </div>
      ) : null}

      {feed.isLoading ? (
        <CardGridSkeleton />
      ) : feed.isError ? (
        <ErrorState
          title="Your feed could not load"
          message="We could not reach any of your sources. Check your connection and try again."
          onRetry={feed.retry}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="size-6" />}
          title="Nothing here yet"
          description="Try following more categories or hashtags to fill your edition."
          action={
            <Link href="/settings" className={buttonClasses()}>
              Choose topics
            </Link>
          }
        />
      ) : (
        <>
          <SortableGrid
            items={visible}
            label="Your feed"
            onReorder={(activeId, overId) =>
              dispatch(reorderFeed({ ids: feed.items.map((item) => item.id), activeId, overId }))
            }
          />
          <LoadMore
            hasMore={feed.hasMore}
            isLoading={feed.isFetchingMore}
            onLoadMore={feed.loadMore}
          />
        </>
      )}
    </>
  );
}
