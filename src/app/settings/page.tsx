import { SlidersHorizontal } from 'lucide-react';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        kicker="Preferences"
        title="Settings"
        description="Choose the categories, sources and hashtags that shape your feed."
      />
      <EmptyState
        icon={<SlidersHorizontal className="size-6" />}
        title="Preferences are coming soon"
        description="You will be able to pick categories, sources and hashtags here."
      />
    </>
  );
}
