import { Flame } from 'lucide-react';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Trending' };

export default function TrendingPage() {
  return (
    <>
      <PageHeader
        kicker="Most read"
        title="Trending now"
        description="What everyone is reading, watching and sharing, by category."
      />
      <EmptyState
        icon={<Flame className="size-6" />}
        title="Trending stories are on the way"
        description="Top headlines, popular movies and the busiest posts will appear here."
      />
    </>
  );
}
