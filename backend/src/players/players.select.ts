import { Prisma } from '@prisma/client';

export const playerSelect = {
  id: true,
  name: true,
  position: true,
  agility: true,
  age: true,
  condition: true,
  baseValue: true,
  pace: true,
  shooting: true,
  passing: true,
  dribbling: true,
  defending: true,
  physical: true,
  potential: true,
  clubId: true,
} satisfies Prisma.PlayerSelect;

export type PlayerRecord = Prisma.PlayerGetPayload<{
  select: typeof playerSelect;
}>;
