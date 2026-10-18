import { Injectable, NotFoundException } from '@nestjs/common';
import { Condition } from '../common/enums/condition.enum';
import { Position } from '../common/enums/position.enum';
import { calculateBaseValue } from '../common/rules/base-value';
import { calculateMarketValue } from '../common/rules/market-value';
import { calculateOverall } from '../common/rules/overall';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerResponse } from './interfaces/player.interface';
import { PlayerRecord, playerSelect } from './players.select';

const PLAYER_NOT_FOUND = 'Jogador não encontrado.';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlayerDto): Promise<PlayerResponse> {
    const overall = calculateOverall(dto.position, dto);
    const baseValue = calculateBaseValue({
      overall,
      potential: dto.potential,
      age: dto.age,
    });

    const player = await this.prisma.player.create({
      data: {
        name: dto.name,
        position: dto.position,
        agility: dto.agility,
        age: dto.age,
        baseValue,
        pace: dto.pace,
        shooting: dto.shooting,
        passing: dto.passing,
        dribbling: dto.dribbling,
        defending: dto.defending,
        physical: dto.physical,
        potential: dto.potential,
      },
      select: playerSelect,
    });

    return this.toResponse(player);
  }

  async findOne(id: number): Promise<PlayerResponse> {
    const player = await this.prisma.player.findFirst({
      where: { id, deletedAt: null },
      select: playerSelect,
    });

    if (!player) {
      throw new NotFoundException(PLAYER_NOT_FOUND);
    }

    return this.toResponse(player);
  }

  private toResponse(player: PlayerRecord): PlayerResponse {
    const position = player.position as Position;
    const condition = player.condition as Condition;

    return {
      id: player.id,
      name: player.name,
      position,
      agility: player.agility,
      age: player.age,
      condition,
      base_value: player.baseValue.toNumber(),
      market_value: calculateMarketValue({
        baseValue: player.baseValue,
        condition,
        agility: player.agility,
        age: player.age,
      }).toNumber(),
      pace: player.pace,
      shooting: player.shooting,
      passing: player.passing,
      dribbling: player.dribbling,
      defending: player.defending,
      physical: player.physical,
      potential: player.potential,
      overall: calculateOverall(position, player),
      club_id: player.clubId,
    };
  }
}
