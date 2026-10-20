import { Prisma } from '@prisma/client';
import { PlayerResponse } from '../players/interfaces/player.interface';
import { PlayerSort, comparePlayersBy } from '../players/player-sort';
import { toPlayerResponse } from '../players/player.mapper';
import { ClubRecord } from './clubs.select';
import { ClubDetailsResponse, ClubResponse } from './interfaces/club.interface';

const SQUAD_ORDER = comparePlayersBy([PlayerSort.POSITION]);

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

export function toClubResponse(club: ClubRecord): ClubResponse {
  return summarize(club, club.players.map(toPlayerResponse));
}

export function toClubDetailsResponse(club: ClubRecord): ClubDetailsResponse {
  const players = club.players.map(toPlayerResponse).sort(SQUAD_ORDER);
  return { ...summarize(club, players), players };
}
