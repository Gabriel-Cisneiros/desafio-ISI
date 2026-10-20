import { PlayerResponse } from '../../players/interfaces/player.interface';

export interface ClubResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface ClubDetailsResponse extends ClubResponse {
  players: PlayerResponse[];
}
