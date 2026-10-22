import { Condition } from '../enums/condition.enum';
import { MatchResult } from '../enums/match-result.enum';
import { Position } from '../enums/position.enum';
import { compareByNameAndId } from './text';

export interface MatchPlayer {
  id: number;
  name: string;
  position: Position;
  condition: Condition;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
}

export type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending';

export interface DuelSide {
  player: MatchPlayer;
  attribute: DuelAttribute;
  value: number;
}

export interface Duel {
  order: number;
  attackingTeam: 'home' | 'away';
  attacker: DuelSide;
  defender: DuelSide;
  goal: boolean;
}

export interface MatchOutcome {
  homeGoals: number;
  awayGoals: number;
  result: MatchResult;
  duels: Duel[];
}

const POSITION_ORDER = Object.values(Position);

const ATTACK_ATTRIBUTE: Record<Position, DuelAttribute> = {
  [Position.GOL]: 'defending',
  [Position.ZAG]: 'dribbling',
  [Position.LAT]: 'dribbling',
  [Position.MEI]: 'passing',
  [Position.ATA]: 'shooting',
};

const MATCHUPS: { attacker: number; defender: number }[] = [
  { attacker: 4, defender: 0 },
  { attacker: 3, defender: 1 },
  { attacker: 2, defender: 2 },
];

export function applyCondition(value: number, condition: Condition): number {
  return condition === Condition.MAL_CONDICIONADO
    ? Math.floor((value * 85 + 50) / 100)
    : value;
}

export function orderTeam(players: MatchPlayer[]): MatchPlayer[] {
  return [...players].sort(
    (a, b) =>
      POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position) ||
      compareByNameAndId(a, b),
  );
}

function duelSide(player: MatchPlayer, attribute: DuelAttribute): DuelSide {
  return {
    player,
    attribute,
    value: applyCondition(player[attribute], player.condition),
  };
}

function attacks(
  attackingTeam: 'home' | 'away',
  attackers: MatchPlayer[],
  defenders: MatchPlayer[],
  firstOrder: number,
): Duel[] {
  return MATCHUPS.map((matchup, index) => {
    const player = attackers[matchup.attacker];
    const attacker = duelSide(player, ATTACK_ATTRIBUTE[player.position]);
    const defender = duelSide(defenders[matchup.defender], 'defending');
    return {
      order: firstOrder + index,
      attackingTeam,
      attacker,
      defender,
      goal: attacker.value > defender.value,
    };
  });
}

export function resultOf(homeGoals: number, awayGoals: number): MatchResult {
  if (homeGoals > awayGoals) {
    return MatchResult.MANDANTE;
  }
  return homeGoals < awayGoals ? MatchResult.VISITANTE : MatchResult.EMPATE;
}

export function playMatch(
  homePlayers: MatchPlayer[],
  awayPlayers: MatchPlayer[],
): MatchOutcome {
  const home = orderTeam(homePlayers);
  const away = orderTeam(awayPlayers);
  const duels = [
    ...attacks('home', home, away, 1),
    ...attacks('away', away, home, MATCHUPS.length + 1),
  ];
  const goalsOf = (team: 'home' | 'away') =>
    duels.filter((duel) => duel.attackingTeam === team && duel.goal).length;
  const homeGoals = goalsOf('home');
  const awayGoals = goalsOf('away');

  return {
    homeGoals,
    awayGoals,
    result: resultOf(homeGoals, awayGoals),
    duels,
  };
}
