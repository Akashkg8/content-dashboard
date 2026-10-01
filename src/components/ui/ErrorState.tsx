'use client';

import { RotateCw, TriangleAlert } from 'lucide-react';

import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  /** When given, shows a retry button. */
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this section. Check your connection and try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="border-danger/40 bg-surface flex flex-col items-center rounded-2xl border px-6 py-12 text-center"
    >
      <TriangleAlert aria-hidden="true" className="text-danger mb-4 size-8" />
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-ink-muted mt-2 max-w-md text-pretty">{message}</p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry}>
          <RotateCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      ) : null}
    </section>
  );
}
