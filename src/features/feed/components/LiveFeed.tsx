'use client';

import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useT } from '@/i18n/useT';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useLiveFeedQuery, type LiveStatus } from '@/services/contentApi';

const STATUS_DOT: Record<LiveStatus, string> = {
  live: 'bg-social',
  connecting: 'bg-movie',
  offline: 'bg-ink-muted',
};

/** Connection state of the real-time stream. Subscribing opens the stream. */
export function LiveBadge() {
  const { data } = useLiveFeedQuery();
  const { t } = useT();
  const status = data?.status ?? 'connecting';
  const dot = STATUS_DOT[status];
  return (
    <span
      className="border-line-strong text-ink-muted inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] tracking-wider uppercase"
      title={t('feed.liveTitle')}
    >
      <span aria-hidden="true" className="relative flex size-2">
        {status === 'live' ? (
          <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60', dot)} />
        ) : null}
        <span className={cn('relative size-2 rounded-full', dot)} />
      </span>
      {t(`feed.${status}`)}
    </span>
  );
}

/** "Just in": posts pushed by the server since the page opened, newest first. */
export function LiveStrip() {
  const { data } = useLiveFeedQuery();
  const { t, language } = useT();
  const posts = data?.posts ?? [];
  // People who ask for less motion get posts that simply appear.
  const reduceMotion = useReducedMotion();
  const newest = posts[0];

  return (
    <>
      {/* Announce arrivals politely, without moving focus. */}
      <p aria-live="polite" className="sr-only">
        {newest ? t('feed.newPost', { author: newest.author, text: newest.description }) : ''}
      </p>
      <section aria-labelledby="live-heading" className="mb-10">
        <h2
          id="live-heading"
          className="text-social mb-3 font-mono text-xs font-medium tracking-[0.2em] uppercase"
        >
          {t('feed.justIn')}
        </h2>
        {/* Fixed height, reserved from the start: arriving posts never shift the feed below. */}
        <ul className="-mx-4 flex h-44 snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {posts.length === 0 ? (
            <li className="border-line-strong text-ink-muted flex w-72 shrink-0 items-center justify-center rounded-2xl border border-dashed p-4 text-sm">
              {t('feed.waiting')}
            </li>
          ) : null}
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <motion.li
                key={post.id}
                layout
                initial={reduceMotion ? false : { opacity: 0, x: -24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="border-social/40 bg-surface shadow-card flex w-72 shrink-0 snap-start flex-col rounded-2xl border p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-semibold">{post.title}</span>{' '}
                    <span className="text-ink-muted">{post.author}</span>
                  </p>
                  <FavoriteButton item={post} className="size-8 shrink-0" />
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed">{post.description}</p>
                <div className="text-ink-muted mt-auto flex items-center justify-between pt-3 font-mono text-[0.6875rem]">
                  <time dateTime={post.publishedAt}>{timeAgo(post.publishedAt, language)}</time>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t(`cta.${post.ctaLabel}`)}: ${post.title} ${t('common.opensNewTab')}`}
                    className="text-social inline-flex items-center gap-1 font-sans text-xs font-semibold hover:underline"
                  >
                    {t(`cta.${post.ctaLabel}`)}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </a>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>
    </>
  );
}
