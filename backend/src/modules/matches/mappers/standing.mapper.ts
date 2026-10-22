import { Standing } from '../../../common/rules/standings';
import { StandingResponse } from '../interfaces/standing.interface';

export function toStandingResponse(standing: Standing): StandingResponse {
  return {
    position: standing.position,
    club_id: standing.club.id,
    club_name: standing.club.name,
    played: standing.played,
    wins: standing.wins,
    draws: standing.draws,
    losses: standing.losses,
    goals_for: standing.goalsFor,
    goals_against: standing.goalsAgainst,
    goal_difference: standing.goalDifference,
    points: standing.points,
  };
}
