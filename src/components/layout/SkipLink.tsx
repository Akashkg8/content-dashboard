'use client';

import { useT } from '@/i18n/useT';

/** First focusable element on every page. Keyboard users jump past the navigation. */
export function SkipLink({ targetId }: { targetId: string }) {
  const { t } = useT();
  return (
    <a
      href={`#${targetId}`}
      className="bg-accent text-on-accent sr-only z-50 rounded-full px-4 py-2 font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {t('common.skipToContent')}
    </a>
  );
}
