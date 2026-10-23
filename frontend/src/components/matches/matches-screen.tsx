'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Plus, Shield, Swords } from 'lucide-react';
import { cn } from 'cn';
import { matchPath } from '@/components/layout/navigation';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { ErrorState, StateMessage } from '@/components/shared/list-state';
import { PageHeader } from '@/components/shared/page-header';
import { SelectFilter } from '@/components/shared/select-filter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClubs } from '@/hooks/data/clubs';
import { useMatches } from '@/hooks/data/league';
import type { Match, MatchTeam } from '@/lib/api/types/league';
import { splitDateTime } from '@/lib/format';
import { MATCH_RESULT_LABELS } from '@/lib/labels';
import { MatchScore } from './match-score';
import { NewMatchDialog } from './new-match-dialog';

const CLUB_PARAM = 'clube';
export const NEW_MATCH_PARAM = 'nova';

function DuelsLink({ id }: { id: number }) {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href={matchPath(id)}>
        Ver duelos
        <ChevronRight data-icon="inline-end" />
      </Link>
    </Button>
  );
}

function TeamCell({
  team,
  acronym,
  winner,
  align,
}: {
  team: MatchTeam;
  acronym: string | undefined;
  winner: boolean;
  align: 'left' | 'right';
}) {
  return (
    <span
      className={cn(
        'flex items-center gap-2',
        align === 'right' && 'flex-row-reverse',
      )}
    >
      <Badge variant="secondary">{acronym}</Badge>
      <span className={cn(winner && 'font-semibold')}>{team.club_name}</span>
    </span>
  );
}

export function MatchesScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const clubParam = searchParams.get(CLUB_PARAM);
  const clubId =
    clubParam && /^\d+$/.test(clubParam) ? Number(clubParam) : undefined;
  const creating = searchParams.has(NEW_MATCH_PARAM);
  const clubs = useClubs();
  const acronyms = useMemo(
    () => new Map(clubs.data?.map((club) => [club.id, club.acronym])),
    [clubs.data],
  );
  const allMatches = useMatches();
  const matches = useMatches({ club_id: clubId });

  function updateParams(change: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    change(params);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const setCreating = (open: boolean) =>
    updateParams((params) =>
      open ? params.set(NEW_MATCH_PARAM, '1') : params.delete(NEW_MATCH_PARAM),
    );
  const newMatchButton = (variant: 'default' | 'outline') => (
    <Button variant={variant} onClick={() => setCreating(true)}>
      <Plus data-icon="inline-start" />
      Nova partida
    </Button>
  );

  const columns: DataTableColumn<Match>[] = [
    {
      key: 'date',
      header: 'Data e hora',
      cell: (match) => {
        const { date, time } = splitDateTime(match.played_at);
        return (
          <span>
            {date} <span className="ml-1 text-muted-foreground">{time}</span>
          </span>
        );
      },
    },
    {
      key: 'home',
      header: 'Mandante',
      align: 'right',
      cell: (match) => (
        <span className="flex justify-end">
          <TeamCell
            team={match.home}
            acronym={acronyms.get(match.home.club_id)}
            winner={match.result === 'MANDANTE'}
            align="right"
          />
        </span>
      ),
    },
    {
      key: 'score',
      header: 'Placar',
      cell: (match) => (
        <Badge variant="secondary" className="font-semibold">
          {match.home.goals} × {match.away.goals}
        </Badge>
      ),
    },
    {
      key: 'away',
      header: 'Visitante',
      cell: (match) => (
        <TeamCell
          team={match.away}
          acronym={acronyms.get(match.away.club_id)}
          winner={match.result === 'VISITANTE'}
          align="left"
        />
      ),
    },
    {
      key: 'result',
      header: 'Resultado',
      cell: (match) => (
        <Badge variant="outline">{MATCH_RESULT_LABELS[match.result]}</Badge>
      ),
    },
    {
      key: 'duels',
      header: <span className="sr-only">Duelos</span>,
      align: 'right',
      cell: (match) => <DuelsLink id={match.id} />,
    },
  ];

  const latest = allMatches.data?.[0];
  const noMatches = allMatches.data?.length === 0;
  const filterClub = clubs.data?.find(({ id }) => id === clubId);
  const total = matches.data?.length ?? 0;

  let content;
  if (allMatches.error && !allMatches.data) {
    content = (
      <ErrorState
        title="Não foi possível carregar as partidas"
        message={allMatches.error}
        onRetry={allMatches.reload}
      />
    );
  } else if (noMatches) {
    content = (
      <StateMessage
        icon={Swords}
        title="Nenhuma partida jogada"
        description="Escale os 5 titulares de dois clubes e jogue a primeira partida. O resultado aparece aqui e na classificação."
        action={newMatchButton('outline')}
      />
    );
  } else {
    content = (
      <>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-muted-foreground">Última partida</h2>
          {latest ? (
            <MatchScore
              match={latest}
              acronyms={acronyms}
              action={<DuelsLink id={latest.id} />}
            />
          ) : (
            <Skeleton className="h-32 rounded-xl" />
          )}
        </section>
        <DataTable
          columns={columns}
          rows={matches.data}
          getRowKey={(match) => match.id}
          loading={matches.loading}
          loadingLabel="Carregando partidas…"
          error={matches.error}
          errorTitle="Não foi possível carregar as partidas"
          onRetry={matches.reload}
          skeletonRows={4}
          emptyInline
          empty={
            <StateMessage
              icon={Swords}
              title={`Nenhuma partida do ${filterClub?.name ?? 'clube'}`}
              description="Escolha outro clube ou veja todas as partidas."
              className="rounded-none border-0"
            />
          }
          toolbar={
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-semibold">Histórico de partidas</h2>
                <p className="text-xs text-muted-foreground">
                  Da mais recente para a mais antiga.
                </p>
              </div>
              <SelectFilter
                label="Clube"
                icon={Shield}
                allLabel="Todos os clubes"
                emptyLabel="todos"
                options={(clubs.data ?? []).map((club) => ({
                  value: club.id,
                  label: club.name,
                }))}
                value={clubId}
                onChange={(next) =>
                  updateParams((params) =>
                    next === undefined
                      ? params.delete(CLUB_PARAM)
                      : params.set(CLUB_PARAM, String(next)),
                  )
                }
              />
            </div>
          }
          footer={
            total > 0 && (
              <span className="text-muted-foreground">
                {total} {total === 1 ? 'partida' : 'partidas'}
              </span>
            )
          }
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Swords}
        title="Partidas"
        description="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
        action={newMatchButton('default')}
      />
      {content}
      <NewMatchDialog
        open={creating}
        clubs={clubs.data ?? []}
        onOpenChange={setCreating}
      />
    </div>
  );
}
