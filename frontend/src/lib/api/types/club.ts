import type { ClubSort } from './enums';
import type { Player } from './player';

export interface Club {
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

export interface SquadPlayer extends Player {
  contract: SquadContract | null;
}

export interface ClubDetails extends Club {
  players: SquadPlayer[];
}

export interface CreateClubBody {
  name: string;
  acronym: string;
}

export interface ListClubsQuery {
  sort?: ClubSort;
}
