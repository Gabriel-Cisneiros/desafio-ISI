import { Prisma } from '@prisma/client';
import { playerSelect } from '../../players/selects/players.select';

export const lineupSelect = {
  id: true,
  formation: true,
  lineup: { select: { player: { select: playerSelect } } },
} satisfies Prisma.ClubSelect;

export type LineupRecord = Prisma.ClubGetPayload<{
  select: typeof lineupSelect;
}>;

export const lineupCandidateSelect = {
  id: true,
  clubId: true,
  position: true,
  condition: true,
} satisfies Prisma.PlayerSelect;
