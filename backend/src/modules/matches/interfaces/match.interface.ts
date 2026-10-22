import { Condition } from '../../../common/enums/condition.enum';
import { Formation } from '../../../common/enums/formation.enum';
import { MatchResult } from '../../../common/enums/match-result.enum';
import { Position } from '../../../common/enums/position.enum';
import { DuelAttribute } from '../../../common/rules/match';

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

export interface DuelResponse {
  order: number;
  attacking_club_id: number;
  attacker: DuelPlayer;
  defender: DuelPlayer;
  goal: boolean;
}

export interface MatchResponse {
  id: number;
  played_at: string;
  home: MatchTeam;
  away: MatchTeam;
  result: MatchResult;
}

export interface MatchDetailsResponse extends MatchResponse {
  duels: DuelResponse[];
}
