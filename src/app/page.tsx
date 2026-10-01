import { Newspaper } from 'lucide-react';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

export default function FeedPage() {
  return (
    <>
      <PageHeader
        kicker="Today's edition"
        title="Your feed"
        description="Headlines, movie picks and posts from the topics you follow, in one place."
      />
      <EmptyState
        icon={<Newspaper className="size-6" />}
        title="Your feed is being set up"
        description="Stories from your chosen categories will appear here."
      />
    </>
  );
}
