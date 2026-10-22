import { Prisma } from '@prisma/client';

export const matchPlayerSelect = {
  id: true,
  name: true,
  position: true,
  condition: true,
  shooting: true,
  passing: true,
  dribbling: true,
  defending: true,
} satisfies Prisma.PlayerSelect;

export const matchClubSelect = {
  id: true,
  formation: true,
  lineup: { select: { player: { select: matchPlayerSelect } } },
} satisfies Prisma.ClubSelect;

export type MatchClubRecord = Prisma.ClubGetPayload<{
  select: typeof matchClubSelect;
}>;

const clubNameSelect = { select: { name: true } } as const;

export const matchSelect = {
  id: true,
  playedAt: true,
  homeClubId: true,
  awayClubId: true,
  homeGoals: true,
  awayGoals: true,
  homeFormation: true,
  awayFormation: true,
  homeClub: clubNameSelect,
  awayClub: clubNameSelect,
} satisfies Prisma.MatchSelect;

export type MatchRecord = Prisma.MatchGetPayload<{
  select: typeof matchSelect;
}>;

export const matchDetailsSelect = {
  ...matchSelect,
  duels: {
    orderBy: { order: 'asc' },
    select: {
      order: true,
      attackingClubId: true,
      attackerId: true,
      attackerName: true,
      attackerPosition: true,
      attackerCondition: true,
      attackAttribute: true,
      attackValue: true,
      defenderId: true,
      defenderName: true,
      defenderPosition: true,
      defenderCondition: true,
      defenseAttribute: true,
      defenseValue: true,
      goal: true,
    },
  },
} satisfies Prisma.MatchSelect;

export type MatchDetailsRecord = Prisma.MatchGetPayload<{
  select: typeof matchDetailsSelect;
}>;
