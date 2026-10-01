import { cn } from '@/lib/utils';

export interface SpinnerProps {
  /** Announced to screen readers. */
  label?: string;
  className?: string;
}

export function Spinner({ label = 'Loading', className }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden="true"
        className="border-line-strong border-t-accent size-5 animate-spin rounded-full border-2 motion-reduce:animate-pulse"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
