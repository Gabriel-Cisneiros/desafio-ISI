import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Condition } from '../../common/enums/condition.enum';
import { Position } from '../../common/enums/position.enum';
import { LINEUP_SIZE } from '../../common/rules/lineup';
import { Duel, MatchPlayer, playMatch } from '../../common/rules/match';
import { PrismaService } from '../../prisma/prisma.service';
import { CLUB_NOT_FOUND, ensureClubExists } from '../clubs/utils/existing-club';
import { CreateMatchDto } from './dto/create-match.dto';
import { ListMatchesQueryDto } from './dto/list-matches-query.dto';
import {
  MatchDetailsResponse,
  MatchResponse,
} from './interfaces/match.interface';
import {
  toMatchDetailsResponse,
  toMatchResponse,
} from './mappers/match.mapper';
import {
  MatchClubRecord,
  matchClubSelect,
  matchDetailsSelect,
  matchSelect,
} from './selects/matches.select';

export const MATCH_NOT_FOUND = 'Partida não encontrada.';

function toMatchPlayers(club: MatchClubRecord): MatchPlayer[] {
  return club.lineup.map(({ player }) => ({
    ...player,
    position: player.position as Position,
    condition: player.condition as Condition,
  }));
}

function toDuelData(
  duel: Duel,
  clubIds: { home: number; away: number },
): Prisma.MatchDuelCreateManyMatchInput {
  return {
    order: duel.order,
    attackingClubId: clubIds[duel.attackingTeam],
    attackerId: duel.attacker.player.id,
    attackerName: duel.attacker.player.name,
    attackerPosition: duel.attacker.player.position,
    attackerCondition: duel.attacker.player.condition,
    attackAttribute: duel.attacker.attribute,
    attackValue: duel.attacker.value,
    defenderId: duel.defender.player.id,
    defenderName: duel.defender.player.name,
    defenderPosition: duel.defender.player.position,
    defenderCondition: duel.defender.player.condition,
    defenseAttribute: duel.defender.attribute,
    defenseValue: duel.defender.value,
    goal: duel.goal,
  };
}

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMatchDto): Promise<MatchDetailsResponse> {
    const clubIds = { home: dto.home_club_id, away: dto.away_club_id };

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM clubes WHERE id IN (${clubIds.home}, ${clubIds.away}) ORDER BY id FOR UPDATE`;
      await tx.$executeRaw`SELECT 1 FROM jogadores WHERE id IN (SELECT jogador_id FROM escalacoes WHERE clube_id IN (${clubIds.home}, ${clubIds.away})) ORDER BY id FOR UPDATE`;

      const home = await this.findClubOrThrow(tx, clubIds.home);
      const away = await this.findClubOrThrow(tx, clubIds.away);

      for (const club of [home, away]) {
        if (club.formation === null || club.lineup.length !== LINEUP_SIZE) {
          throw new ConflictException(
            `O clube ${club.id} não tem a escalação completa, com os ${LINEUP_SIZE} titulares.`,
          );
        }
      }

      const outcome = playMatch(toMatchPlayers(home), toMatchPlayers(away));
      const match = await tx.match.create({
        data: {
          homeClubId: clubIds.home,
          awayClubId: clubIds.away,
          homeGoals: outcome.homeGoals,
          awayGoals: outcome.awayGoals,
          homeFormation: home.formation!,
          awayFormation: away.formation!,
          playedAt: new Date(),
          duels: {
            createMany: {
              data: outcome.duels.map((duel) => toDuelData(duel, clubIds)),
            },
          },
        },
        select: matchDetailsSelect,
      });

      return toMatchDetailsResponse(match);
    });
  }

  async list(query: ListMatchesQueryDto): Promise<MatchResponse[]> {
    const clubId = query.club_id;
    if (clubId !== undefined) {
      await ensureClubExists(this.prisma, clubId);
    }

    const matches = await this.prisma.match.findMany({
      where:
        clubId === undefined
          ? undefined
          : { OR: [{ homeClubId: clubId }, { awayClubId: clubId }] },
      orderBy: [{ playedAt: 'desc' }, { id: 'desc' }],
      select: matchSelect,
    });

    return matches.map(toMatchResponse);
  }

  async findOne(id: number): Promise<MatchDetailsResponse> {
    const match = await this.prisma.match.findUnique({
      where: { id },
      select: matchDetailsSelect,
    });
    if (!match) {
      throw new NotFoundException(MATCH_NOT_FOUND);
    }

    return toMatchDetailsResponse(match);
  }

  private async findClubOrThrow(
    db: Prisma.TransactionClient,
    id: number,
  ): Promise<MatchClubRecord> {
    const club = await db.club.findUnique({
      where: { id },
      select: matchClubSelect,
    });
    if (!club) {
      throw new NotFoundException(CLUB_NOT_FOUND);
    }
    return club;
  }
}
