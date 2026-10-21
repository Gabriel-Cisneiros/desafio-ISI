import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CLUB_NOT_FOUND } from '../clubs/existing-club';
import { Condition } from '../common/enums/condition.enum';
import { Position } from '../common/enums/position.enum';
import { fitsFormation } from '../common/rules/lineup';
import { ACTIVE_PLAYER, PLAYER_NOT_FOUND } from '../players/active-player';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLineupDto } from './dto/update-lineup.dto';
import { LineupResponse } from './interfaces/lineup.interface';
import { toLineupResponse } from './lineup.mapper';
import { lineupCandidateSelect, lineupSelect } from './lineups.select';

@Injectable()
export class LineupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(clubId: number): Promise<LineupResponse> {
    return toLineupResponse(await this.findLineupOrThrow(this.prisma, clubId));
  }

  update(clubId: number, dto: UpdateLineupDto): Promise<LineupResponse> {
    const playerIds = dto.player_ids;

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM clubes WHERE id = ${clubId} FOR UPDATE`;
      await tx.$executeRaw`SELECT 1 FROM jogadores WHERE id IN (${Prisma.join(playerIds)}) ORDER BY id FOR UPDATE`;

      const club = await tx.club.findUnique({
        where: { id: clubId },
        select: { id: true },
      });
      if (!club) {
        throw new NotFoundException(CLUB_NOT_FOUND);
      }

      const players = await tx.player.findMany({
        where: { ...ACTIVE_PLAYER, id: { in: playerIds } },
        select: lineupCandidateSelect,
      });
      if (players.length !== playerIds.length) {
        throw new NotFoundException(PLAYER_NOT_FOUND);
      }
      if (players.some((player) => player.clubId !== clubId)) {
        throw new ConflictException(
          'Todos os titulares precisam ser do elenco do clube.',
        );
      }
      if (
        players.some(
          (player) => (player.condition as Condition) === Condition.DOENTE,
        )
      ) {
        throw new ConflictException('Jogador DOENTE não pode ser escalado.');
      }
      if (
        !fitsFormation(
          players.map((player) => player.position as Position),
          dto.formation,
        )
      ) {
        throw new ConflictException(
          `As posições dos titulares não fecham a formação ${dto.formation}: é preciso 1 GOL e os jogadores de linha de cada setor.`,
        );
      }

      await tx.lineupEntry.deleteMany({ where: { clubId } });
      await tx.lineupEntry.createMany({
        data: playerIds.map((playerId) => ({ clubId, playerId })),
      });
      await tx.club.update({
        where: { id: clubId },
        data: { formation: dto.formation },
      });

      return toLineupResponse(await this.findLineupOrThrow(tx, clubId));
    });
  }

  private async findLineupOrThrow(
    db: Prisma.TransactionClient,
    clubId: number,
  ) {
    const club = await db.club.findUnique({
      where: { id: clubId },
      select: lineupSelect,
    });
    if (!club) {
      throw new NotFoundException(CLUB_NOT_FOUND);
    }
    return club;
  }
}
