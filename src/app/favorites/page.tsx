import { Heart } from 'lucide-react';
import Link from 'next/link';

import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Favorites' };

export default function FavoritesPage() {
  return (
    <>
      <PageHeader
        kicker="Saved for later"
        title="Favorites"
        description="Everything you have saved, in the order you like."
      />
      <EmptyState
        icon={<Heart className="size-6" />}
        title="Nothing saved yet"
        description="Tap the heart on any story, movie or post to keep it here."
        action={
          <Link href="/" className={buttonClasses()}>
            Browse my feed
          </Link>
        }
      />
    </>
  );
}
