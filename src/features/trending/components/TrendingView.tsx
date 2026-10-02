'use client';

import { ArrowUpRight, Flame } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';

import { CardGridSkeleton } from '@/components/content/CardGridSkeleton';
import { ContentCard } from '@/components/content/ContentCard';
import { DataOriginBadge } from '@/components/content/DataOriginBadge';
import { CATEGORY_ICONS, SOURCE_META } from '@/components/content/sourceStyles';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/utils';
import { useTrendingQuery } from '@/services/contentApi';
import {
  CATEGORIES,
  type ContentItem,
  type ContentSource,
  type TrendingCategory,
} from '@/types/content';

const TABS: TrendingCategory[] = ['all', ...CATEGORIES];

const COLUMNS = [
  { source: 'news', titleKey: 'trending.mostRead' },
  { source: 'movie', titleKey: 'trending.mostWatched' },
  { source: 'social', titleKey: 'trending.mostShared' },
] as const;

export function TrendingView() {
  const [category, setCategory] = useState<TrendingCategory>('all');
  const { t } = useT();
  const { currentData, isFetching, isError, refetch } = useTrendingQuery(category);

  const lists: Record<ContentSource, ContentItem[]> = {
    news: currentData?.news ?? [],
    movie: currentData?.movies ?? [],
    social: currentData?.social ?? [],
  };
  const [lead, ...restNews] = lists.news;
  const panelId = 'trending-panel';

  return (
    <>
      <PageHeader
        kicker={t('trending.kicker')}
        title={t('trending.title')}
        description={t('trending.description')}
        actions={currentData ? <DataOriginBadge origins={[currentData.origins]} /> : null}
      />

      <CategoryTabs value={category} onChange={setCategory} panelId={panelId} />

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`tab-${category}`}
        aria-busy={isFetching}
        tabIndex={0}
        className="mt-8 outline-none"
      >
        {isError ? (
          <ErrorState
            title={t('trending.errorTitle')}
            message={t('trending.errorMessage')}
            onRetry={() => void refetch()}
          />
        ) : !currentData ? (
          <CardGridSkeleton count={3} />
        ) : lists.news.length + lists.movie.length + lists.social.length === 0 ? (
          <EmptyState
            icon={<Flame className="size-6" />}
            title={t('trending.emptyTitle')}
            description={t('trending.emptyDescription')}
          />
        ) : (
          <div className="space-y-12">
            {lead ? (
              <section aria-labelledby="lead-heading">
                <h2 id="lead-heading" className="sr-only">
                  {t('trending.topStory')}
                </h2>
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <ContentCard item={lead} rank={1} priority className="animate-fade-up" />
                  <RankedList items={restNews.slice(0, 4)} startRank={2} source="news" />
                </div>
              </section>
            ) : null}
            <div className="border-ink grid gap-10 border-t-2 pt-8 md:grid-cols-2 xl:grid-cols-3">
              {COLUMNS.map(({ source, titleKey }) => (
                <section key={source} aria-labelledby={`col-${source}`}>
                  <h2
                    id={`col-${source}`}
                    className={cn(
                      'mb-4 font-mono text-xs font-medium tracking-[0.2em] uppercase',
                      SOURCE_META[source].text,
                    )}
                  >
                    {t(titleKey)}
                  </h2>
                  {lists[source].length ? (
                    <RankedList items={lists[source]} startRank={1} source={source} />
                  ) : (
                    <p className="text-ink-muted text-sm">{t('trending.emptyColumn')}</p>
                  )}
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** Accessible tabs: arrow keys move between categories, Home and End jump to the ends. */
function CategoryTabs({
  value,
  onChange,
  panelId,
}: {
  value: TrendingCategory;
  onChange: (value: TrendingCategory) => void;
  panelId: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const { t } = useT();

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = TABS.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % TABS.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + TABS.length) % TABS.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    onChange(TABS[next]!);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={t('trending.tabsLabel')}
      className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0"
    >
      {TABS.map((tab, index) => {
        const selected = tab === value;
        const Icon = tab === 'all' ? Flame : CATEGORY_ICONS[tab];
        return (
          <button
            key={tab}
            ref={(node) => {
              refs.current[index] = node;
            }}
            id={`tab-${tab}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors',
              selected ? 'bg-ink text-paper' : 'text-ink-muted hover:bg-surface hover:text-ink',
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {tab === 'all' ? t('trending.all') : t(`categories.${tab}`)}
          </button>
        );
      })}
    </div>
  );
}

/** Newspaper-style ranked list with big serif numerals. */
function RankedList({
  items,
  startRank,
  source,
}: {
  items: ContentItem[];
  startRank: number;
  source: ContentSource;
}) {
  const { t } = useT();
  return (
    <ol className="divide-line divide-y" start={startRank}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className="animate-fade-up flex gap-4 py-4 first:pt-0"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span
            aria-hidden="true"
            className={cn(
              'font-display w-8 shrink-0 text-4xl leading-none font-semibold italic',
              SOURCE_META[source].text,
            )}
          >
            {startRank + index}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-ink-muted font-mono text-[0.6875rem] tracking-wider uppercase">
              {t(`categories.${item.category}`)} /{' '}
              <span className="normal-case">{item.author}</span>
            </p>
            <h3 className="font-display mt-1 line-clamp-3 text-lg leading-snug font-semibold">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="decoration-2 underline-offset-4 hover:underline"
              >
                {item.title}
                <span className="sr-only"> {t('common.opensNewTab')}</span>
                <ArrowUpRight aria-hidden="true" className="ml-1 inline size-4 opacity-50" />
              </a>
            </h3>
          </div>
          <FavoriteButton item={item} className="size-9 shrink-0" />
        </li>
      ))}
    </ol>
  );
}
