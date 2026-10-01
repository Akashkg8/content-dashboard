'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';

import { Badge } from '@/components/ui/Badge';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, type ContentItem } from '@/types/content';

import { SOURCE_META } from './sourceStyles';

export interface ContentCardProps {
  item: ContentItem;
  /** Shown as a large serif numeral, used by Trending. */
  rank?: number;
  /** Drag handle slot, filled by `SortableGrid`. */
  handle?: ReactNode;
  /** Load the image eagerly. Use for the first row only. */
  priority?: boolean;
  className?: string;
}

export function ContentCard({ item, rank, handle, priority, className }: ContentCardProps) {
  const meta = SOURCE_META[item.source];
  const isPost = item.source === 'social';

  return (
    <article
      className={cn(
        'group/card border-line bg-surface shadow-card relative flex h-full flex-col overflow-hidden rounded-2xl border',
        'transition-[transform,box-shadow,border-color] duration-300 ease-out',
        'hover:border-line-strong hover:shadow-lift hover:-translate-y-1 motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <CardMedia item={item} priority={priority} />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="flex items-center gap-2">
          <Badge tone={meta.tone} className="bg-surface/90 backdrop-blur">
            <meta.icon aria-hidden="true" className="size-3" />
            {meta.label}
          </Badge>
          {rank ? (
            <span className="bg-ink text-paper font-display rounded-full px-2.5 py-0.5 text-sm font-semibold italic">
              No. {rank}
            </span>
          ) : null}
        </div>
        <FavoriteButton item={item} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-ink-muted flex flex-wrap items-center gap-x-2 font-mono text-[0.6875rem] tracking-wider uppercase">
          <span className={meta.text}>{CATEGORY_LABELS[item.category]}</span>
          <span aria-hidden="true">/</span>
          <span className="truncate normal-case">{item.author}</span>
          {item.source !== 'movie' ? (
            <>
              <span aria-hidden="true">/</span>
              <time dateTime={item.publishedAt} className="normal-case">
                {timeAgo(item.publishedAt)}
              </time>
            </>
          ) : null}
        </p>

        <h3
          className={cn(
            'font-display mt-3 font-semibold tracking-tight text-balance',
            isPost ? 'text-lg' : 'line-clamp-3 text-xl leading-snug',
          )}
        >
          {item.title}
        </h3>

        <p
          className={cn(
            'mt-2 text-pretty',
            isPost
              ? 'text-ink text-[0.9375rem] leading-relaxed'
              : 'text-ink-muted line-clamp-3 text-sm',
          )}
        >
          {item.description}
        </p>

        {item.hashtags?.length ? (
          <ul aria-label="Hashtags" className="mt-3 flex flex-wrap gap-1.5">
            {item.hashtags.map((tag) => (
              <li key={tag} className="text-social font-mono text-xs">
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-5">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.ctaLabel}: ${item.title} (opens in a new tab)`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full text-sm font-semibold',
              'decoration-2 underline-offset-4 hover:underline',
              meta.text,
            )}
          >
            {item.ctaLabel}
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
            />
          </a>
          {handle}
        </div>
      </div>
    </article>
  );
}

/** Photo when there is one, otherwise a typographic placeholder in the source's colour. */
function CardMedia({ item, priority }: { item: ContentItem; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  const meta = SOURCE_META[item.source];

  if (item.imageUrl && !failed) {
    return (
      <div className="bg-surface-sunken relative aspect-[16/9] overflow-hidden">
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03] motion-reduce:group-hover/card:scale-100"
        />
      </div>
    );
  }

  // Text-only posts: just room for the badges, with a thin rule in the post colour.
  if (item.source === 'social') {
    return (
      <div aria-hidden="true" className={cn('h-14 border-b-2 opacity-60', 'border-social/40')} />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="bg-surface-sunken relative flex aspect-[16/9] items-end overflow-hidden p-5"
    >
      <span className={cn('absolute inset-0 opacity-10', meta.bg)} />
      <span className="font-display text-ink/15 line-clamp-2 text-4xl leading-none font-semibold italic">
        {item.title}
      </span>
    </div>
  );
}
