import { UserRound } from 'lucide-react';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <>
      <PageHeader kicker="Account" title="Your profile" description="Your name, avatar and bio." />
      <EmptyState
        icon={<UserRound className="size-6" />}
        title="You are browsing as a guest"
        description="Sign-in and profile editing are coming soon."
      />
    </>
  );
}
