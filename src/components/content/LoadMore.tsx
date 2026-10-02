'use client';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useT } from '@/i18n/useT';

export interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  /** Shown when there is nothing more to load. */
  endMessage?: string;
}

/**
 * Infinite scroll plus a real button. Scrolling near the end loads the next
 * page automatically; the button covers keyboard users and old browsers.
 */
export function LoadMore({ hasMore, isLoading, onLoadMore, endMessage }: LoadMoreProps) {
  const { t } = useT();
  const sentinelRef = useInfiniteScroll(onLoadMore, { enabled: hasMore && !isLoading });

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      {isLoading ? (
        <Spinner label={t('common.loadingMore')} />
      ) : hasMore ? (
        <Button variant="secondary" onClick={onLoadMore}>
          {t('common.loadMore')}
        </Button>
      ) : (
        <p className="text-ink-muted font-display text-lg italic">
          {endMessage ?? t('common.caughtUp')}
        </p>
      )}
    </div>
  );
}
