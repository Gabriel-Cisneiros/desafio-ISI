'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Goal, HeartPulse, SearchX } from 'lucide-react';
import { ErrorState, StateMessage } from '@/components/shared/list-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClubs } from '@/hooks/data/clubs';
import { useMatch } from '@/hooks/data/league';
import { DuelsTable } from './duels-table';
import { MatchPitch } from './match-pitch';
import { MatchScore } from './match-score';
import { matchPlayers } from './match-teams';

export const MATCHES_PATH = '/partidas';

const backLink = (
  <Button variant="ghost" asChild className="w-fit px-2">
    <Link href={MATCHES_PATH}>
      <ArrowLeft data-icon="inline-start" />
      Voltar para partidas
    </Link>
  </Button>
);

export function MatchScreen() {
  const { id } = useParams<{ id: string }>();
  const match = useMatch(Number(id));
  const clubs = useClubs();
  const acronyms = useMemo(
    () => new Map(clubs.data?.map((club) => [club.id, club.acronym])),
    [clubs.data],
  );

  if (match.errorStatus === 404) {
    return (
      <StateMessage
        icon={SearchX}
        title="Partida não encontrada"
        description={`${match.error} O endereço pode estar errado ou a partida não existe.`}
        action={
          <Button variant="outline" asChild>
            <Link href={MATCHES_PATH}>
              <ArrowLeft data-icon="inline-start" />
              Voltar para partidas
            </Link>
          </Button>
        }
      />
    );
  }
  if (match.error && !match.data) {
    return (
      <ErrorState
        title="Não foi possível carregar a partida"
        message={match.error}
        onRetry={match.reload}
      />
    );
  }
  const data = match.data?.id === Number(id) ? match.data : undefined;
  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {backLink}
      <MatchScore match={data} acronyms={acronyms} showFormation />

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-semibold">Em campo</h2>
            <p className="text-xs text-muted-foreground">
              Titulares de cada clube na formação da partida e os valores usados
              nos duelos, já com o efeito da condição.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-warning text-white">
                <HeartPulse className="size-2.5" />
              </span>
              Mal condicionado
            </span>
            <span className="flex items-center gap-1.5">
              <Goal className="size-4" />
              Gol no duelo
            </span>
          </div>
        </div>
        <div className="p-5">
          <MatchPitch
            home={{
              team: data.home,
              players: matchPlayers(data, data.home.club_id),
              side: 'home',
            }}
            away={{
              team: data.away,
              players: matchPlayers(data, data.away.club_id),
              side: 'away',
            }}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-0.5 border-b px-5 py-4">
          <h2 className="font-semibold">Duelos</h2>
          <p className="text-xs text-muted-foreground">
            Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de
            linha vão do 1º (o mais recuado) ao 4º (o mais avançado), pela ordem
            do elenco: o 4º ataca o goleiro, o 3º ataca o 1º e o 2º ataca o 2º.
          </p>
        </div>
        <DuelsTable match={data} acronyms={acronyms} />
      </section>
    </div>
  );
}
