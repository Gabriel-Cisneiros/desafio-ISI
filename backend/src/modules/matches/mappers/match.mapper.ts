import { Condition } from '../../../common/enums/condition.enum';
import { Formation } from '../../../common/enums/formation.enum';
import { Position } from '../../../common/enums/position.enum';
import { formatBrazilDateTime } from '../../../common/rules/datetime';
import { DuelAttribute, resultOf } from '../../../common/rules/match';
import {
  DuelResponse,
  MatchDetailsResponse,
  MatchResponse,
} from '../interfaces/match.interface';
import { MatchDetailsRecord, MatchRecord } from '../selects/matches.select';

type DuelRecord = MatchDetailsRecord['duels'][number];

function toDuelResponse(duel: DuelRecord): DuelResponse {
  return {
    order: duel.order,
    attacking_club_id: duel.attackingClubId,
    attacker: {
      player_id: duel.attackerId,
      player_name: duel.attackerName,
      position: duel.attackerPosition as Position,
      condition: duel.attackerCondition as Condition,
      attribute: duel.attackAttribute as DuelAttribute,
      value: duel.attackValue,
    },
    defender: {
      player_id: duel.defenderId,
      player_name: duel.defenderName,
      position: duel.defenderPosition as Position,
      condition: duel.defenderCondition as Condition,
      attribute: duel.defenseAttribute as DuelAttribute,
      value: duel.defenseValue,
    },
    goal: duel.goal,
  };
}

export function toMatchResponse(match: MatchRecord): MatchResponse {
  return {
    id: match.id,
    played_at: formatBrazilDateTime(match.playedAt),
    home: {
      club_id: match.homeClubId,
      club_name: match.homeClub.name,
      formation: match.homeFormation as Formation,
      goals: match.homeGoals,
    },
    away: {
      club_id: match.awayClubId,
      club_name: match.awayClub.name,
      formation: match.awayFormation as Formation,
      goals: match.awayGoals,
    },
    result: resultOf(match.homeGoals, match.awayGoals),
  };
}

export function toMatchDetailsResponse(
  match: MatchDetailsRecord,
): MatchDetailsResponse {
  return { ...toMatchResponse(match), duels: match.duels.map(toDuelResponse) };
}
