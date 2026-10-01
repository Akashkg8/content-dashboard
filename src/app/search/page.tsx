import { SearchX } from 'lucide-react';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? '';

  return (
    <>
      <PageHeader
        kicker="Search"
        title={query ? `Results for "${query}"` : 'Search everything'}
        description="One search across news, movies and social posts."
      />
      <EmptyState
        icon={<SearchX className="size-6" />}
        title={query ? 'Search results are coming soon' : 'Type to start searching'}
        description="Use the search box at the top of the page."
      />
    </>
  );
}
