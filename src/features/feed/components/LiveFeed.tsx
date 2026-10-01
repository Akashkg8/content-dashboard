'use client';

import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useLiveFeedQuery, type LiveStatus } from '@/services/contentApi';

const STATUS_COPY: Record<LiveStatus, { label: string; dot: string }> = {
  live: { label: 'Live', dot: 'bg-social' },
  connecting: { label: 'Connecting', dot: 'bg-movie' },
  offline: { label: 'Offline', dot: 'bg-ink-muted' },
};

/** Connection state of the real-time stream. Subscribing opens the stream. */
export function LiveBadge() {
  const { data } = useLiveFeedQuery();
  const status = data?.status ?? 'connecting';
  const copy = STATUS_COPY[status];
  return (
    <span
      className="border-line-strong text-ink-muted inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] tracking-wider uppercase"
      title="New posts arrive in real time over Server-Sent Events"
    >
      <span aria-hidden="true" className="relative flex size-2">
        {status === 'live' ? (
          <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60', copy.dot)} />
        ) : null}
        <span className={cn('relative size-2 rounded-full', copy.dot)} />
      </span>
      {copy.label}
    </span>
  );
}

/** "Just in": posts pushed by the server since the page opened, newest first. */
export function LiveStrip() {
  const { data } = useLiveFeedQuery();
  const posts = data?.posts ?? [];
  const newest = posts[0];

  return (
    <>
      {/* Announce arrivals politely, without moving focus. */}
      <p aria-live="polite" className="sr-only">
        {newest ? `New post from ${newest.author}: ${newest.description}` : ''}
      </p>
      {posts.length > 0 ? (
        <section aria-labelledby="live-heading" className="mb-10">
          <h2
            id="live-heading"
            className="text-social mb-3 font-mono text-xs font-medium tracking-[0.2em] uppercase"
          >
            Just in
          </h2>
          <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            <AnimatePresence initial={false}>
              {posts.map((post) => (
                <motion.li
                  key={post.id}
                  layout
                  initial={{ opacity: 0, x: -24, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  className="border-social/40 bg-surface shadow-card w-72 shrink-0 snap-start rounded-2xl border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">
                      <span className="font-semibold">{post.title}</span>{' '}
                      <span className="text-ink-muted">{post.author}</span>
                    </p>
                    <FavoriteButton item={post} className="size-8 shrink-0" />
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed">{post.description}</p>
                  <div className="text-ink-muted mt-3 flex items-center justify-between font-mono text-[0.6875rem]">
                    <time dateTime={post.publishedAt}>{timeAgo(post.publishedAt)}</time>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${post.ctaLabel}: ${post.title} (opens in a new tab)`}
                      className="text-social inline-flex items-center gap-1 font-sans text-xs font-semibold hover:underline"
                    >
                      {post.ctaLabel}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ) : null}
    </>
  );
}
