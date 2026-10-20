import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { compareByNameAndId } from '../common/rules/text';
import { PrismaService } from '../prisma/prisma.service';
import { toClubDetailsResponse, toClubResponse } from './club.mapper';
import { clubSelect } from './clubs.select';
import { CreateClubDto } from './dto/create-club.dto';
import { CLUB_NOT_FOUND } from './existing-club';
import { ClubDetailsResponse, ClubResponse } from './interfaces/club.interface';

export const MAX_CLUBS = 20;
const CLUB_CREATION_LOCK = 1001;

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateClubDto): Promise<ClubResponse> {
    const normalizedName = dto.name.toLowerCase();

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${CLUB_CREATION_LOCK})`;

      if ((await tx.club.count()) >= MAX_CLUBS) {
        throw new ConflictException(
          `A liga já tem ${MAX_CLUBS} clubes, o máximo permitido.`,
        );
      }
      if (await tx.club.findUnique({ where: { normalizedName } })) {
        throw new ConflictException('Já existe um clube com esse nome.');
      }
      if (await tx.club.findUnique({ where: { acronym: dto.acronym } })) {
        throw new ConflictException('Já existe um clube com essa sigla.');
      }

      const club = await tx.club.create({
        data: { name: dto.name, normalizedName, acronym: dto.acronym },
        select: clubSelect,
      });
      return toClubResponse(club);
    });
  }

  async list(): Promise<ClubResponse[]> {
    const clubs = await this.prisma.club.findMany({ select: clubSelect });
    return clubs.map(toClubResponse).sort(compareByNameAndId);
  }

  async findOne(id: number): Promise<ClubDetailsResponse> {
    const club = await this.prisma.club.findUnique({
      where: { id },
      select: clubSelect,
    });

    if (!club) {
      throw new NotFoundException(CLUB_NOT_FOUND);
    }

    return toClubDetailsResponse(club);
  }
}
