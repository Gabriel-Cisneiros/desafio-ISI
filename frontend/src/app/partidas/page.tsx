import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MatchesScreen } from '@/components/matches/matches-screen';

export const metadata: Metadata = { title: 'Partidas · Passe' };

export default function MatchesPage() {
  return (
    <Suspense>
      <MatchesScreen />
    </Suspense>
  );
}
