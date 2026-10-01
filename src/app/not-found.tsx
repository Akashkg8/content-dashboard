import { Compass } from 'lucide-react';
import Link from 'next/link';

import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <EmptyState
      icon={<Compass className="size-6" />}
      title="This page is not in today's edition"
      description="The link may be old, or the page may have moved."
      action={
        <Link href="/" className={buttonClasses()}>
          Back to my feed
        </Link>
      }
    />
  );
}
