'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/ui/ErrorState';

/** Error boundary for every route below the root layout. */
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="This page hit a snag"
      message="Something went wrong while loading this page. Your preferences and favorites are safe."
      onRetry={retry}
    />
  );
}
