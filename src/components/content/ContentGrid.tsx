import type { ContentItem } from '@/types/content';

import { ContentCard } from './ContentCard';

export const GRID_CLASSES = 'grid gap-6 md:grid-cols-2 xl:grid-cols-3';

/** Staggered entrance for newly mounted cards. Stagger restarts every page of nine. */
export const entranceDelay = (index: number) => ({ animationDelay: `${(index % 9) * 45}ms` });

export function ContentGrid({ items, label }: { items: readonly ContentItem[]; label: string }) {
  return (
    <ul aria-label={label} className={GRID_CLASSES}>
      {items.map((item, index) => (
        <li key={item.id} className="animate-fade-up" style={entranceDelay(index)}>
          <ContentCard item={item} priority={index < 3} />
        </li>
      ))}
    </ul>
  );
}
