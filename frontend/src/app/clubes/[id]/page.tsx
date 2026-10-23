import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ClubScreen } from '@/components/clubs/club-screen';

export const metadata: Metadata = { title: 'Clube · Passe' };

export default function ClubPage() {
  return (
    <Suspense>
      <ClubScreen />
    </Suspense>
  );
}
