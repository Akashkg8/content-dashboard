import { cn } from '@/lib/utils';

/** Decorative placeholder block. Wrap groups in an element with `aria-busy` and a label. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface-sunken animate-shimmer rounded-md bg-size-[200%_100%]',
        'bg-[linear-gradient(90deg,transparent_0%,rgb(255_255_255/0.35)_50%,transparent_100%)]',
        'dark:bg-[linear-gradient(90deg,transparent_0%,rgb(255_255_255/0.04)_50%,transparent_100%)]',
        className,
      )}
    />
  );
}
