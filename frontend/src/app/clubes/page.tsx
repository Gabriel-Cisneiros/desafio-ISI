import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ClubsScreen } from '@/components/clubs/clubs-screen';

export const metadata: Metadata = { title: 'Clubes · Passe' };

export default function ClubsPage() {
  return (
    <Suspense>
      <ClubsScreen />
    </Suspense>
  );
}
