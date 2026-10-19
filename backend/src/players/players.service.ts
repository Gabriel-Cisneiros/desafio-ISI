import { ConflictException, Injectable } from '@nestjs/common';
import { Condition } from '../common/enums/condition.enum';
import { Position } from '../common/enums/position.enum';
import { calculateBaseValue } from '../common/rules/base-value';
import { calculateMarketValue } from '../common/rules/market-value';
import { calculateOverall } from '../common/rules/overall';
import { PrismaService } from '../prisma/prisma.service';
import { findActivePlayerOrThrow } from './active-player';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerResponse } from './interfaces/player.interface';
import {
  PlayerRecord,
  playerSelect,
  playerStateSelect,
} from './players.select';

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
    const player = await findActivePlayerOrThrow(this.prisma, id, playerSelect);
    return this.toResponse(player);
  }

  async update(id: number, dto: UpdatePlayerDto): Promise<PlayerResponse> {
    const current = await findActivePlayerOrThrow(
      this.prisma,
      id,
      playerStateSelect,
    );

    if (dto.age < current.age) {
      throw new ConflictException(
        `A idade não pode ser menor que a atual (${current.age}).`,
      );
    }
    if (
      current.clubId !== null &&
      dto.position !== (current.position as Position)
    ) {
      throw new ConflictException(
        'Jogador com clube não pode mudar de posição.',
      );
    }

    const player = await this.prisma.player.update({
      where: { id },
      data: {
        name: dto.name,
        position: dto.position,
        agility: dto.agility,
        age: dto.age,
      },
      select: playerSelect,
    });

    return this.toResponse(player);
  }

  async updateCondition(
    id: number,
    dto: UpdateConditionDto,
  ): Promise<PlayerResponse> {
    const current = await findActivePlayerOrThrow(
      this.prisma,
      id,
      playerStateSelect,
    );
    const currentCondition = current.condition as Condition;

    if (
      currentCondition === Condition.DOENTE &&
      dto.condition === Condition.APTO
    ) {
      throw new ConflictException(
        'Jogador DOENTE não pode passar direto para APTO. Passe antes por MAL_CONDICIONADO.',
      );
    }
    if (currentCondition === dto.condition) {
      return this.findOne(id);
    }

    const player = await this.prisma.$transaction(async (tx) => {
      if (dto.condition === Condition.DOENTE) {
        await tx.lineupEntry.deleteMany({ where: { playerId: id } });
      }

      return tx.player.update({
        where: { id },
        data: { condition: dto.condition },
        select: playerSelect,
      });
    });

    return this.toResponse(player);
  }

  async remove(id: number): Promise<void> {
    const player = await findActivePlayerOrThrow(
      this.prisma,
      id,
      playerStateSelect,
    );

    if (player.clubId !== null) {
      throw new ConflictException(
        'Jogador com clube não pode ser excluído. Venda o jogador antes.',
      );
    }

    await this.prisma.player.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
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
