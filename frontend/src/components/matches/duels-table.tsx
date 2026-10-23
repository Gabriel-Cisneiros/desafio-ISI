import { Fragment } from 'react';
import { Goal } from 'lucide-react';
import { PlayerAvatar } from '@/components/shared/player-avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  DuelPlayer,
  MatchDetails,
  MatchTeam,
} from '@/lib/api/types/league';
import { DUEL_ATTRIBUTE_LABELS } from '@/lib/labels';
import { duelIndexes, lineLabel, teamDuels } from './match-teams';

function DuelPlayerCell({
  player,
  index,
  clubName,
}: {
  player: DuelPlayer;
  index: number;
  clubName: string;
}) {
  return (
    <span className="flex items-center gap-3">
      <PlayerAvatar id={player.player_id} name={player.player_name} />
      <span className="flex flex-col">
        <span className="font-medium">{player.player_name}</span>
        <span className="text-xs text-muted-foreground">
          {player.position === 'GOL'
            ? 'Goleiro'
            : `${player.position}, ${lineLabel(player.position, index)}`}{' '}
          · {clubName}
        </span>
      </span>
    </span>
  );
}

function AttributeValue({ player }: { player: DuelPlayer }) {
  return (
    <span className="text-muted-foreground">
      {DUEL_ATTRIBUTE_LABELS[player.attribute]}{' '}
      <span className="font-semibold text-foreground">{player.value}</span>
    </span>
  );
}

export function DuelsTable({
  match,
  acronyms,
}: {
  match: MatchDetails;
  acronyms: Map<number, string>;
}) {
  const groups: { team: MatchTeam; opponent: MatchTeam; role: string }[] = [
    { team: match.home, opponent: match.away, role: 'mandante' },
    { team: match.away, opponent: match.home, role: 'visitante' },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Duelo</TableHead>
          <TableHead>Atacante</TableHead>
          <TableHead>Ataque</TableHead>
          <TableHead>Defensor</TableHead>
          <TableHead>Defesa</TableHead>
          <TableHead>Resultado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map(({ team, opponent, role }) => {
          const duels = teamDuels(match, team.club_id);
          const goals = duels.filter((duel) => duel.goal).length;
          return (
            <Fragment key={team.club_id}>
              <TableRow className="bg-muted-subtle hover:bg-muted-subtle">
                <TableCell colSpan={5} className="h-10 text-xs">
                  <span className="mr-2 font-medium">
                    {acronyms.get(team.club_id)}
                  </span>
                  Ataques do {team.club_name} ({role})
                </TableCell>
                <TableCell className="h-10 text-right text-xs text-muted-foreground">
                  {goals} {goals === 1 ? 'gol' : 'gols'}
                </TableCell>
              </TableRow>
              {duels.map((duel, order) => {
                const { attacker, defender } = duelIndexes(order);
                return (
                  <TableRow key={duel.order}>
                    <TableCell>
                      <Badge variant="outline">{duel.order}</Badge>
                    </TableCell>
                    <TableCell>
                      <DuelPlayerCell
                        player={duel.attacker}
                        index={attacker}
                        clubName={team.club_name}
                      />
                    </TableCell>
                    <TableCell>
                      <AttributeValue player={duel.attacker} />
                    </TableCell>
                    <TableCell>
                      <DuelPlayerCell
                        player={duel.defender}
                        index={defender}
                        clubName={opponent.club_name}
                      />
                    </TableCell>
                    <TableCell>
                      <AttributeValue player={duel.defender} />
                    </TableCell>
                    <TableCell>
                      {duel.goal ? (
                        <Badge variant="success">
                          <Goal />
                          Gol
                        </Badge>
                      ) : (
                        <Badge variant="outline">Sem gol</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
