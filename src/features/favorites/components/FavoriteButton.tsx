'use client';

import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { ContentItem } from '@/types/content';

import { toggleFavorite } from '../favoritesSlice';
import { selectIsFavorite } from '../selectors';

/**
 * Toggle button: the label stays the same and `aria-pressed` carries the
 * state, which is how screen readers expect toggle buttons to behave.
 */
export function FavoriteButton({ item, className }: { item: ContentItem; className?: string }) {
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, item.id));

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={`Favorite: ${item.title}`}
      title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
      onClick={() => dispatch(toggleFavorite(item))}
      className={cn(
        'bg-surface/90 inline-flex size-10 items-center justify-center rounded-full backdrop-blur',
        'shadow-card hover:bg-surface transition-colors duration-150',
        isFavorite ? 'text-accent' : 'text-ink',
        className,
      )}
    >
      <motion.span
        key={String(isFavorite)}
        aria-hidden="true"
        initial={isFavorite ? { scale: 0.6 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        className="inline-flex"
      >
        <Heart className="size-[1.125rem]" fill={isFavorite ? 'currentColor' : 'none'} />
      </motion.span>
    </button>
  );
}
