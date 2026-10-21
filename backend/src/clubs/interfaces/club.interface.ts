import { PlayerResponse } from '../../players/interfaces/player.interface';

export interface ClubResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface SquadContract {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

export interface SquadPlayerResponse extends PlayerResponse {
  contract: SquadContract | null;
}

export interface ClubDetailsResponse extends ClubResponse {
  players: SquadPlayerResponse[];
}
