'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';

import { CardGridSkeleton } from '@/components/content/CardGridSkeleton';
import { SortableGrid } from '@/components/content/SortableGrid';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useT } from '@/i18n/useT';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useStoreHydrated } from '@/store/useStoreHydrated';

import { reorderFavorites } from '../favoritesSlice';
import { selectFavoriteItems } from '../selectors';

export function FavoritesView() {
  const dispatch = useAppDispatch();
  const { t } = useT();
  const items = useAppSelector(selectFavoriteItems);
  const hydrated = useStoreHydrated();

  return (
    <>
      <PageHeader
        kicker={t('favorites.kicker')}
        title={t('favorites.title')}
        description={
          hydrated && items.length
            ? t('favorites.count', { count: items.length })
            : t('favorites.description')
        }
      />
      {!hydrated ? (
        <CardGridSkeleton count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-6" />}
          title={t('favorites.emptyTitle')}
          description={t('favorites.emptyDescription')}
          action={
            <Link href="/" className={buttonClasses()}>
              {t('favorites.browse')}
            </Link>
          }
        />
      ) : (
        <SortableGrid
          items={items}
          label={t('favorites.listLabel')}
          onReorder={(activeId, overId) => dispatch(reorderFavorites({ activeId, overId }))}
        />
      )}
    </>
  );
}
