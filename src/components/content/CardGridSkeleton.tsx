import { Skeleton } from '@/components/ui/Skeleton';

/** Placeholder grid shown while a section loads. Matches the content card layout. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading content"
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border-line bg-surface overflow-hidden rounded-2xl border">
          <Skeleton className="aspect-[16/9] rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-6 w-11/12" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
