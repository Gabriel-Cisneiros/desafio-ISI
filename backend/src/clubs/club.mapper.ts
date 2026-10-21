import { Prisma } from '@prisma/client';
import { formatBrazilDateTime } from '../common/rules/datetime';
import {
  calculatePenaltyRate,
  calculateRemainingDays,
} from '../common/rules/loyalty';
import { PlayerResponse } from '../players/interfaces/player.interface';
import { SQUAD_ORDER } from '../players/player-sort';
import { toPlayerResponse } from '../players/player.mapper';
import { ClubDetailsRecord, ClubRecord } from './clubs.select';
import {
  ClubDetailsResponse,
  ClubResponse,
  SquadContract,
  SquadPlayerResponse,
} from './interfaces/club.interface';

type SquadPlayerRecord = ClubDetailsRecord['players'][number];

function summarize(club: ClubRecord, players: PlayerResponse[]): ClubResponse {
  const squadValue = players.reduce(
    (total, player) => total.plus(player.market_value),
    new Prisma.Decimal(0),
  );

  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: club.cash.toNumber(),
    squad_value: squadValue.toNumber(),
    net_worth: club.cash.plus(squadValue).toNumber(),
  };
}

function toSquadContract(
  player: SquadPlayerRecord,
  now: Date,
): SquadContract | null {
  const [contract] = player.contracts;
  if (!contract) {
    return null;
  }

  const remainingDays = calculateRemainingDays(contract.loyaltyUntil, now);
  return {
    purchase_value: contract.purchaseValue.toNumber(),
    loyalty_until: formatBrazilDateTime(contract.loyaltyUntil),
    remaining_days: remainingDays,
    penalty_rate: calculatePenaltyRate(remainingDays),
  };
}

export function toClubResponse(club: ClubRecord): ClubResponse {
  return summarize(club, club.players.map(toPlayerResponse));
}

export function toClubDetailsResponse(
  club: ClubDetailsRecord,
  now: Date,
): ClubDetailsResponse {
  const players: SquadPlayerResponse[] = club.players
    .map((player) => ({
      ...toPlayerResponse(player),
      contract: toSquadContract(player, now),
    }))
    .sort(SQUAD_ORDER);

  return { ...summarize(club, players), players };
}
