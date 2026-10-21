import { Formation } from '../../common/enums/formation.enum';
import { PlayerResponse } from '../../players/interfaces/player.interface';

export interface LineupResponse {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: PlayerResponse[];
}
