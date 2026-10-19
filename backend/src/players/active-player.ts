import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const PLAYER_NOT_FOUND = 'Jogador não encontrado.';

export function activePlayerWhere(id: number): Prisma.PlayerWhereInput {
  return { id, deletedAt: null };
}

export async function findActivePlayerOrThrow<S extends Prisma.PlayerSelect>(
  db: Prisma.TransactionClient,
  id: number,
  select: S,
): Promise<Prisma.PlayerGetPayload<{ select: S }>> {
  const player = await db.player.findFirst({
    where: activePlayerWhere(id),
    select,
  });

  if (!player) {
    throw new NotFoundException(PLAYER_NOT_FOUND);
  }

  return player;
}
