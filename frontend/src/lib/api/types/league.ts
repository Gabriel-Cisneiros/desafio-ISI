import type {
  Condition,
  DuelAttribute,
  Formation,
  MatchResult,
  Position,
} from './enums';
import type { Player } from './player';

export interface Lineup {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: Player[];
}

export interface UpdateLineupBody {
  formation: Formation;
  player_ids: number[];
}

export interface MatchTeam {
  club_id: number;
  club_name: string;
  formation: Formation;
  goals: number;
}

export interface DuelPlayer {
  player_id: number;
  player_name: string;
  position: Position;
  condition: Condition;
  attribute: DuelAttribute;
  value: number;
}

export interface Duel {
  order: number;
  attacking_club_id: number;
  attacker: DuelPlayer;
  defender: DuelPlayer;
  goal: boolean;
}

export interface Match {
  id: number;
  played_at: string;
  home: MatchTeam;
  away: MatchTeam;
  result: MatchResult;
}

export interface MatchDetails extends Match {
  duels: Duel[];
}

export interface CreateMatchBody {
  home_club_id: number;
  away_club_id: number;
}

export interface ListMatchesQuery {
  club_id?: number;
}

export interface Standing {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
