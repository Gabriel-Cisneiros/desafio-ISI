import type { Condition, DuelAttribute, Position } from '@/lib/api/types/enums';
import type { Duel, DuelPlayer, MatchDetails } from '@/lib/api/types/league';

const ATTACKER_INDEX = [4, 3, 2];
const DEFENDER_INDEX = [0, 1, 2];

export interface MatchPlayer {
  id: number;
  name: string;
  position: Position;
  condition: Condition;
  index: number;
  attributes: { attribute: DuelAttribute; value: number }[];
  scored: boolean;
}

function addPlayer(
  team: Map<number, MatchPlayer>,
  player: DuelPlayer,
  index: number,
  scored: boolean,
) {
  const current = team.get(index) ?? {
    id: player.player_id,
    name: player.player_name,
    position: player.position,
    condition: player.condition,
    index,
    attributes: [],
    scored: false,
  };
  if (
    !current.attributes.some(({ attribute }) => attribute === player.attribute)
  ) {
    current.attributes.push({
      attribute: player.attribute,
      value: player.value,
    });
  }
  current.scored ||= scored;
  team.set(index, current);
}

export function teamDuels(match: MatchDetails, clubId: number): Duel[] {
  return match.duels.filter((duel) => duel.attacking_club_id === clubId);
}

export function matchPlayers(
  match: MatchDetails,
  clubId: number,
): MatchPlayer[] {
  const team = new Map<number, MatchPlayer>();
  const opponentId =
    clubId === match.home.club_id ? match.away.club_id : match.home.club_id;
  teamDuels(match, clubId).forEach((duel, order) =>
    addPlayer(team, duel.attacker, ATTACKER_INDEX[order], duel.goal),
  );
  teamDuels(match, opponentId).forEach((duel, order) =>
    addPlayer(team, duel.defender, DEFENDER_INDEX[order], false),
  );
  return [...team.values()].sort((a, b) => a.index - b.index);
}

export function lineLabel(position: Position, index: number): string {
  return position === 'GOL' ? 'Goleiro' : `${index}º de linha`;
}

export function duelIndexes(order: number): {
  attacker: number;
  defender: number;
} {
  return { attacker: ATTACKER_INDEX[order], defender: DEFENDER_INDEX[order] };
}
