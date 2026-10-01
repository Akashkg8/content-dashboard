import { ProfileView } from '@/features/auth/components/ProfileView';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfilePage() {
  return <ProfileView />;
}
