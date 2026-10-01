import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  /** Usually a button or link that gets the user out of the empty state. */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        'border-line-strong flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="bg-surface text-accent shadow-card mb-5 inline-flex size-14 items-center justify-center rounded-full"
      >
        {icon}
      </span>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="text-ink-muted mt-2 max-w-md text-pretty">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
