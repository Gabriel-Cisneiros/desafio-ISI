import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MatchScreen } from '@/components/matches/match-screen';

export const metadata: Metadata = { title: 'Partida · Passe' };

export default function MatchPage() {
  return (
    <Suspense>
      <MatchScreen />
    </Suspense>
  );
}
