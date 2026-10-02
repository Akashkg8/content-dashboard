'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/ui/ErrorState';
import { useT } from '@/i18n/useT';

/** Error boundary for every route below the root layout. */
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title={t('pages.routeErrorTitle')}
      message={t('pages.routeErrorMessage')}
      onRetry={retry}
    />
  );
}
