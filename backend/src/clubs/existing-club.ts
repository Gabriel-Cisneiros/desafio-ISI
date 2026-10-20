import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const CLUB_NOT_FOUND = 'Clube não encontrado.';

export async function ensureClubExists(
  db: Prisma.TransactionClient,
  id: number,
): Promise<void> {
  const club = await db.club.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!club) {
    throw new NotFoundException(CLUB_NOT_FOUND);
  }
}
