import type { Metadata } from 'next';
import { StandingsScreen } from '@/components/matches/standings-screen';

export const metadata: Metadata = { title: 'Classificação · Passe' };

export default function StandingsPage() {
  return <StandingsScreen />;
}
