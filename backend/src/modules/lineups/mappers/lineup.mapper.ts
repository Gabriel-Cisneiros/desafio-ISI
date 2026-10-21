import { Formation } from '../../../common/enums/formation.enum';
import { LINEUP_SIZE } from '../../../common/rules/lineup';
import { SQUAD_ORDER } from '../../players/utils/player-sort';
import { toPlayerResponse } from '../../players/mappers/player.mapper';
import { LineupResponse } from '../interfaces/lineup.interface';
import { LineupRecord } from '../selects/lineups.select';

export function toLineupResponse(club: LineupRecord): LineupResponse {
  const players = club.lineup
    .map((entry) => toPlayerResponse(entry.player))
    .sort(SQUAD_ORDER);

  return {
    club_id: club.id,
    formation: club.formation as Formation | null,
    complete: club.formation !== null && players.length === LINEUP_SIZE,
    players,
  };
}
