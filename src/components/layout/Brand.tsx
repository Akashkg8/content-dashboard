import Link from 'next/link';

import { cn } from '@/lib/utils';

export const APP_NAME = 'Dispatch';

/** Wordmark in the style of a newspaper masthead. */
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-baseline gap-1.5 rounded-sm', className)}
      aria-label={`${APP_NAME}, go to my feed`}
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
