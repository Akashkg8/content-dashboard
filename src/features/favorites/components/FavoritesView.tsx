'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';

import { CardGridSkeleton } from '@/components/content/CardGridSkeleton';
import { SortableGrid } from '@/components/content/SortableGrid';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useStoreHydrated } from '@/store/useStoreHydrated';

import { reorderFavorites } from '../favoritesSlice';
import { selectFavoriteItems } from '../selectors';

export function FavoritesView() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectFavoriteItems);
  const hydrated = useStoreHydrated();

  return (
    <>
      <PageHeader
        kicker="Saved for later"
        title="Favorites"
        description={
          hydrated && items.length
            ? `${items.length} saved ${items.length === 1 ? 'item' : 'items'}. Drag the grip to put them in your own order.`
            : 'Everything you save, in the order you like.'
        }
      />
      {!hydrated ? (
        <CardGridSkeleton count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-6" />}
          title="Nothing saved yet"
          description="Tap the heart on any story, movie or post to keep it here. Favorites are saved on this device."
          action={
            <Link href="/" className={buttonClasses()}>
              Browse my feed
            </Link>
          }
        />
      ) : (
        <SortableGrid
          items={items}
          label="Your favorites"
          onReorder={(activeId, overId) => dispatch(reorderFavorites({ activeId, overId }))}
        />
      )}
    </>
  );
}
