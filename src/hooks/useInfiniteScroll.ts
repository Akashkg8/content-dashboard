import { useEffect, useRef, useState } from 'react';

/**
 * Calls `onLoadMore` when the returned sentinel element scrolls near the
 * viewport. Pair it with a visible "Load more" button: keyboard and
 * screen-reader users, and browsers without IntersectionObserver, use that.
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  { enabled, rootMargin = '600px' }: { enabled: boolean; rootMargin?: string },
) {
  const [sentinel, setSentinel] = useState<Element | null>(null);
  const callback = useRef(onLoadMore);

  useEffect(() => {
    callback.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!sentinel || !enabled || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callback.current();
      },
      { rootMargin },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, enabled, rootMargin]);

  return setSentinel;
}
