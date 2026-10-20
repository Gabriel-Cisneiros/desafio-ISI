import { Prisma } from '@prisma/client';
import { ACTIVE_PLAYER } from '../players/active-player';
import { playerSelect } from '../players/players.select';

export const clubSelect = {
  id: true,
  name: true,
  acronym: true,
  cash: true,
  players: { where: ACTIVE_PLAYER, select: playerSelect },
} satisfies Prisma.ClubSelect;

export type ClubRecord = Prisma.ClubGetPayload<{ select: typeof clubSelect }>;
