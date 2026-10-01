import { SearchView } from '@/features/search/components/SearchView';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q } = await searchParams;
  const query = ((Array.isArray(q) ? q[0] : q) ?? '').trim().slice(0, 100);
  return <SearchView query={query} />;
}
