'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ListOrdered, Plus } from 'lucide-react';
import { cn } from 'cn';
import { clubPath } from '@/components/layout/navigation';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { StateMessage } from '@/components/shared/list-state';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClubs } from '@/hooks/data/clubs';
import { useMatches, useStandings } from '@/hooks/data/league';
import type { Standing } from '@/lib/api/types/league';
import { formatDateTime } from '@/lib/format';
import { NEW_MATCH_PARAM } from './matches-screen';

const LATEST_MATCHES = 5;

const TIEBREAKERS = [
  'Mais pontos',
  'Maior saldo de gols',
  'Mais gols marcados',
  'Nome do clube, de A a Z',
];

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

export function StandingsScreen() {
  const standings = useStandings();
  const matches = useMatches();
  const clubs = useClubs();
  const acronyms = useMemo(
    () => new Map(clubs.data?.map((club) => [club.id, club.acronym])),
    [clubs.data],
  );

  const number = (
    key: keyof Standing,
    header: string,
    render?: (standing: Standing) => string | number,
  ): DataTableColumn<Standing> => ({
    key,
    header,
    align: 'right',
    cell: (standing) => render?.(standing) ?? standing[key],
  });

  const columns: DataTableColumn<Standing>[] = [
    {
      key: 'position',
      header: '#',
      cell: (standing) => (
        <span
          className={cn(
            'flex size-6 items-center justify-center rounded-md text-xs font-medium',
            standing.position === 1
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted',
          )}
        >
          {standing.position}
        </span>
      ),
    },
    {
      key: 'club',
      header: 'Clube',
      className: 'w-full',
      cell: (standing) => (
        <span className="flex items-center gap-2">
          <Badge variant="secondary">{acronyms.get(standing.club_id)}</Badge>
          <Link
            href={clubPath(standing.club_id)}
            className="underline underline-offset-3 hover:text-primary"
          >
            {standing.club_name}
          </Link>
        </span>
      ),
    },
    number('played', 'J'),
    number('wins', 'V'),
    number('draws', 'E'),
    number('losses', 'D'),
    number('goals_for', 'GP'),
    number('goals_against', 'GC'),
    number('goal_difference', 'SG', (standing) =>
      signed(standing.goal_difference),
    ),
    {
      key: 'points',
      header: 'Pts',
      align: 'right',
      cell: (standing) => (
        <span className="font-semibold">{standing.points}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={ListOrdered}
        title="Classificação"
        description="Todos os clubes, com 3 pontos por vitória e 1 por empate."
        action={
          <Button variant="outline" asChild>
            <Link href={`/partidas?${NEW_MATCH_PARAM}=1`}>
              <Plus data-icon="inline-start" />
              Nova partida
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-[1fr_19rem] items-start gap-4">
        <DataTable
          columns={columns}
          rows={standings.data}
          getRowKey={(standing) => standing.club_id}
          loading={standings.loading}
          loadingLabel="Carregando classificação…"
          error={standings.error}
          errorTitle="Não foi possível carregar a classificação"
          onRetry={standings.reload}
          skeletonRows={6}
          empty={
            <StateMessage
              icon={ListOrdered}
              title="Nenhum clube cadastrado"
              description="A classificação mostra todos os clubes, mesmo os que ainda não jogaram."
            />
          }
          footer={
            <span className="text-xs text-muted-foreground">
              J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols
              marcados · GC: gols sofridos · SG: saldo de gols · Pts: pontos
            </span>
          }
        />

        <div className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Últimas partidas</h2>
              <p className="text-xs text-muted-foreground">
                Da mais recente para a mais antiga.
              </p>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4">
              {matches.data?.length === 0 && (
                <p className="text-muted-foreground">
                  Nenhuma partida jogada ainda.
                </p>
              )}
              {matches.data?.slice(0, LATEST_MATCHES).map((match) => (
                <div key={match.id} className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(match.played_at)}
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        match.result === 'MANDANTE' && 'font-semibold',
                      )}
                    >
                      {match.home.club_name}
                    </span>
                    <Badge variant="secondary" className="font-semibold">
                      {match.home.goals} × {match.away.goals}
                    </Badge>
                    <span
                      className={cn(
                        match.result === 'VISITANTE' && 'font-semibold',
                      )}
                    >
                      {match.away.club_name}
                    </span>
                  </span>
                </div>
              ))}
              <Button variant="link" asChild className="w-fit px-0">
                <Link href="/partidas">
                  Ver todas as partidas
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Ordem da tabela</h2>
              <p className="text-xs text-muted-foreground">
                Critérios de classificação, nesta ordem.
              </p>
            </div>
            <ol className="flex flex-col gap-3 px-5 py-4">
              {TIEBREAKERS.map((criterion, index) => (
                <li key={criterion} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  {criterion}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
