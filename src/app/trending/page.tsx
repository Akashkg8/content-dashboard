import { TrendingView } from '@/features/trending/components/TrendingView';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Trending' };

export default function TrendingPage() {
  return <TrendingView />;
}
