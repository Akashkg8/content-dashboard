'use client';

import Link from 'next/link';

import { useT } from '@/i18n/useT';
import { cn } from '@/lib/utils';

export const APP_NAME = 'Dispatch';

/** Wordmark in the style of a newspaper masthead. */
export function Brand({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-baseline gap-1.5 rounded-sm', className)}
      aria-label={t('common.goHome', { app: APP_NAME })}
    >
      <span className="font-display text-[1.75rem] leading-none font-semibold tracking-tight italic">
        {APP_NAME}
      </span>
      <span
        aria-hidden="true"
        className="bg-accent size-2 rounded-full transition-transform duration-300 group-hover:scale-150"
      />
    </Link>
  );
}
