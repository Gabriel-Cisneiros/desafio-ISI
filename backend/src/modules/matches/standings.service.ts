import { Injectable } from '@nestjs/common';
import { calculateStandings } from '../../common/rules/standings';
import { PrismaService } from '../../prisma/prisma.service';
import { StandingResponse } from './interfaces/standing.interface';
import { toStandingResponse } from './mappers/standing.mapper';

@Injectable()
export class StandingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<StandingResponse[]> {
    const [clubs, matches] = await this.prisma.$transaction([
      this.prisma.club.findMany({ select: { id: true, name: true } }),
      this.prisma.match.findMany({
        select: {
          homeClubId: true,
          awayClubId: true,
          homeGoals: true,
          awayGoals: true,
        },
      }),
    ]);

    return calculateStandings(clubs, matches).map(toStandingResponse);
  }
}
