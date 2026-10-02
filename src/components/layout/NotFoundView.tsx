'use client';

import { Compass } from 'lucide-react';
import Link from 'next/link';

import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useT } from '@/i18n/useT';

export function NotFoundView() {
  const { t } = useT();
  return (
    <EmptyState
      icon={<Compass className="size-6" />}
      title={t('pages.notFoundTitle')}
      description={t('pages.notFoundDescription')}
      action={
        <Link href="/" className={buttonClasses()}>
          {t('pages.backToFeed')}
        </Link>
      }
    />
  );
}
