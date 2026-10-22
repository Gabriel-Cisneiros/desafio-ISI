import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PlayersScreen } from '@/components/players/players-screen';

export const metadata: Metadata = { title: 'Jogadores · Passe' };

export default function PlayersPage() {
  return (
    <Suspense>
      <PlayersScreen />
    </Suspense>
  );
}
