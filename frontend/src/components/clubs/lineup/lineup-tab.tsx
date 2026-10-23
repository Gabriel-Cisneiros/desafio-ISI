'use client';

import { useState } from 'react';
import {
  Check,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  Lock,
  Swords,
  TriangleAlert,
} from 'lucide-react';
import { ConditionBadge } from '@/components/shared/condition-badge';
import { ErrorState } from '@/components/shared/list-state';
import { PlayerAvatar } from '@/components/shared/player-avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApiAction } from '@/hooks/use-api-action';
import { useApiQuery } from '@/hooks/use-api-query';
import { lineupsService } from '@/lib/api/services/lineups';
import type { ClubDetails, SquadPlayer } from '@/lib/api/types/club';
import type { Formation } from '@/lib/api/types/enums';
import type { Lineup } from '@/lib/api/types/league';
import { POSITION_LABELS } from '@/lib/labels';
import { FormationPicker } from './formation-picker';
import { LineupPitch } from './lineup-pitch';
import {
  DEFAULT_FORMATION,
  LINEUP_SIZE,
  fillSlots,
  formationSlots,
  teamIndex,
  usedAttributes,
} from './lineup-rules';

function joinNames(names: string[]): string {
  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`
    : (names[0] ?? '');
}

interface LineupTabProps {
  club: ClubDetails;
}

export function LineupTab({ club }: LineupTabProps) {
  const lineup = useApiQuery(['lineup', club.id], () =>
    lineupsService.get(club.id),
  );

  if (lineup.error && !lineup.data) {
    return (
      <ErrorState
        title="Não foi possível carregar a escalação"
        message={lineup.error}
        onRetry={lineup.reload}
      />
    );
  }
  if (!lineup.data) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  return (
    <LineupEditor
      key={JSON.stringify(lineup.data)}
      club={club}
      saved={lineup.data}
    />
  );
}

function LineupEditor({ club, saved }: { club: ClubDetails; saved: Lineup }) {
  const savedFormation = saved.formation ?? DEFAULT_FORMATION;
  const [formation, setFormation] = useState<Formation>(savedFormation);
  const [slotIds, setSlotIds] = useState(() =>
    fillSlots(formationSlots(savedFormation), saved.players),
  );
  const [error, setError] = useState<string>();
  const save = useApiAction(lineupsService.update, {
    errorTitle: 'A escalação foi recusada',
    onError: setError,
    success: (result) => ({
      title: 'Escalação salva',
      description: `${club.name} na ${result.formation}, com os ${result.players.length} titulares devolvidos pela API.`,
    }),
  });

  const slots = formationSlots(formation);
  const squad = club.players;
  const byId = new Map(squad.map((player) => [player.id, player]));
  const starters = slotIds.map((id) =>
    id === undefined ? undefined : byId.get(id),
  );
  const complete = starters.every(Boolean);
  const reserves = squad.filter((player) => !slotIds.includes(player.id));
  const unfit = starters.filter(
    (player): player is SquadPlayer => player?.condition === 'MAL_CONDICIONADO',
  );

  function changeFormation(next: Formation) {
    const chosen = starters.filter((player): player is SquadPlayer => !!player);
    setFormation(next);
    setSlotIds(fillSlots(formationSlots(next), chosen));
    setError(undefined);
  }

  function changeSlot(index: number, id: number) {
    setSlotIds((current) =>
      current.map((value, position) => (position === index ? id : value)),
    );
    setError(undefined);
  }

  function reset() {
    setFormation(savedFormation);
    setSlotIds(fillSlots(formationSlots(savedFormation), saved.players));
    setError(undefined);
  }

  function submit() {
    if (!complete) {
      return;
    }
    setError(undefined);
    void save.run(club.id, {
      formation,
      player_ids: slotIds as number[],
    });
  }

  const incompleteAlert = !saved.complete && (
    <Alert variant="warning">
      <TriangleAlert />
      <AlertTitle>
        Escalação incompleta: o {club.name} não pode jogar partidas
      </AlertTitle>
      <AlertDescription>
        {squad.length < LINEUP_SIZE
          ? `O elenco tem ${squad.length} ${squad.length === 1 ? 'jogador' : 'jogadores'}, e a escalação precisa de ${LINEUP_SIZE}: 1 goleiro e 4 jogadores de linha. Compre jogadores e salve a escalação com os ${LINEUP_SIZE} titulares.`
          : saved.formation
            ? 'Um titular saiu da escalação, vendido ou DOENTE. Escolha quem entra em cada vaga vazia e salve de novo.'
            : `Escolha a formação e os ${LINEUP_SIZE} titulares e salve a escalação.`}
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="flex flex-col gap-4">
      {!saved.formation && incompleteAlert}
      <div className="grid grid-cols-[1fr_20rem] items-start gap-4">
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-semibold">Titulares</h2>
              <p className="text-xs text-muted-foreground">
                1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar
                troca os 5 de uma vez.
              </p>
            </div>
            {saved.complete ? (
              <Badge variant="success">
                <CircleCheck />
                Completa
              </Badge>
            ) : (
              <Badge variant="warning">
                <TriangleAlert />
                Incompleta
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-4 px-5 py-4">
            {error && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>A escalação foi recusada</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {saved.formation && incompleteAlert}
            <div className="flex flex-col gap-1">
              <h3 className="font-medium">Formação</h3>
              <p className="text-xs text-muted-foreground">
                Os números contam os jogadores de linha de trás para frente. O
                goleiro fica fora da conta.
              </p>
            </div>
            <FormationPicker
              value={formation}
              onChange={changeFormation}
              disabled={save.pending}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaga</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead className="text-right">Overall</TableHead>
                <TableHead>Atributos usados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot, index) => {
                const player = starters[index];
                const options = squad.filter(
                  (candidate) =>
                    slot.positions.includes(candidate.position) &&
                    candidate.condition !== 'DOENTE' &&
                    (candidate.id === slotIds[index] ||
                      !slotIds.includes(candidate.id)),
                );
                const id = `lineup-slot-${index}`;
                const empty = options.length === 0;
                return (
                  <TableRow key={`${formation}-${index}`}>
                    <TableCell>
                      <span className="flex flex-col">
                        <label htmlFor={id} className="font-medium">
                          {slot.label}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {slot.positions.join(' ou ')}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="w-60">
                      <Select
                        value={player ? String(player.id) : ''}
                        onValueChange={(value) =>
                          changeSlot(index, Number(value))
                        }
                        disabled={empty || save.pending}
                      >
                        <SelectTrigger
                          id={id}
                          className="w-56"
                          aria-describedby={
                            !player && !empty ? `${id}-error` : undefined
                          }
                        >
                          <SelectValue
                            placeholder={
                              empty
                                ? `Sem ${slot.positions.join(' ou ')} no elenco`
                                : 'Escolha o titular'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((candidate) => (
                            <SelectItem
                              key={candidate.id}
                              value={String(candidate.id)}
                            >
                              {candidate.name} ({candidate.position})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!player && !empty && (
                        <p
                          id={`${id}-error`}
                          className="mt-1.5 flex items-center gap-1.5 text-xs whitespace-normal text-destructive"
                        >
                          <CircleAlert className="size-3.5 shrink-0" />
                          Escolha o titular desta vaga.
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {player && (
                        <ConditionBadge condition={player.condition} />
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {player?.overall}
                    </TableCell>
                    <TableCell>
                      {player && (
                        <span className="flex gap-4">
                          {usedAttributes(
                            player,
                            teamIndex(slotIds, squad, index),
                          ).map(({ label, value }) => (
                            <span key={label} className="text-muted-foreground">
                              {label}{' '}
                              <span className="font-semibold text-foreground">
                                {value}
                              </span>
                            </span>
                          ))}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {unfit.length > 0 && (
            <div className="border-t px-5 py-4">
              <Alert variant="warning">
                <TriangleAlert />
                <AlertTitle>
                  {joinNames(unfit.map(({ name }) => name))}{' '}
                  {unfit.length > 1
                    ? 'estão mal condicionados'
                    : 'está mal condicionado'}
                </AlertTitle>
                <AlertDescription>
                  Podem jogar, mas cada atributo vale 15% a menos durante a
                  partida.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t px-5 py-4">
            <p className="text-xs text-muted-foreground">
              {complete
                ? 'A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar depois de escalar de novo.'
                : 'Escolha a formação e um titular para cada vaga para salvar.'}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" disabled={save.pending} onClick={reset}>
                Cancelar
              </Button>
              <Button disabled={!complete || save.pending} onClick={submit}>
                {save.pending ? (
                  <LoaderCircle
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : (
                  <Check data-icon="inline-start" />
                )}
                Salvar escalação
              </Button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Em campo</h2>
              <p className="text-xs text-muted-foreground">
                {complete
                  ? `Prévia da formação ${formation}, do goleiro ao ataque.`
                  : `Prévia da formação ${formation}; as vagas vazias ficam tracejadas.`}
              </p>
            </div>
            <div className="p-4">
              <LineupPitch formation={formation} starters={starters} />
            </div>
            <p className="flex items-start gap-2 border-t bg-muted-subtle px-5 py-3 text-xs text-muted-foreground">
              <Swords className="mt-px size-3.5 shrink-0" />
              Na partida, atacam os 3 jogadores de linha mais avançados e
              defendem o goleiro e os 2 mais recuados. É gol quando o ataque é
              maior que a defesa.
            </p>
          </section>

          <section className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Reservas</h2>
              <p className="text-xs text-muted-foreground">
                Jogadores do elenco fora da escalação.
              </p>
            </div>
            {reserves.length === 0 ? (
              <p className="px-5 py-4 text-muted-foreground">
                Nenhum reserva: os {squad.length} jogadores do elenco estão
                escolhidos.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {reserves.map((player) => (
                  <li key={player.id} className="flex flex-col gap-2 px-5 py-3">
                    <span className="flex items-center gap-3">
                      <PlayerAvatar id={player.id} name={player.name} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-medium">{player.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {POSITION_LABELS[player.position]}
                        </span>
                      </span>
                      <ConditionBadge condition={player.condition} />
                    </span>
                    {player.condition === 'DOENTE' && (
                      <span className="flex items-center gap-2 rounded-md bg-muted-subtle px-3 py-2 text-xs text-muted-foreground">
                        <Lock className="size-3.5" />
                        Doente não pode ser escalado.
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
