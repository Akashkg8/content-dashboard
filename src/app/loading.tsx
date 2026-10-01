import { CardGridSkeleton } from '@/components/content/CardGridSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

/** Shown instantly on navigation while a route segment renders. */
export default function Loading() {
  return (
    <div>
      <div className="border-line mb-8 space-y-3 border-b-2 pb-5">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-12 w-72 max-w-full" />
      </div>
      <CardGridSkeleton />
    </div>
  );
}
