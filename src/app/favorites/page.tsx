import { FavoritesView } from '@/features/favorites/components/FavoritesView';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Favorites' };

export default function FavoritesPage() {
  return <FavoritesView />;
}
