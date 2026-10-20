import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CLUB_NOT_FOUND } from '../clubs/existing-club';
import { Condition } from '../common/enums/condition.enum';
import { ContractStatus } from '../common/enums/contract-status.enum';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { parseBrazilDateTime } from '../common/rules/datetime';
import { MAX_LOYALTY_DAYS, isValidLoyaltyEnd } from '../common/rules/loyalty';
import { calculateMarketValue } from '../common/rules/market-value';
import {
  calculatePurchaseFee,
  isWithinCashLimit,
} from '../common/rules/purchase';
import { findActivePlayerOrThrow } from '../players/active-player';
import { playerMarketSelect } from '../players/players.select';
import { PrismaService } from '../prisma/prisma.service';
import { BuyPlayerDto } from './dto/buy-player.dto';
import { MarketOperationResponse } from './interfaces/transaction.interface';
import { toMarketOperationResponse } from './market.mapper';
import { contractSelect, transactionSelect } from './market.select';

export const MAX_SQUAD_SIZE = 12;

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  buy(playerId: number, dto: BuyPlayerDto): Promise<MarketOperationResponse> {
    const now = new Date();
    const loyaltyUntil = parseBrazilDateTime(dto.loyalty_until)!;

    if (!isValidLoyaltyEnd(loyaltyUntil, now)) {
      throw new BadRequestException(
        `O campo loyalty_until deve ser depois do momento da compra e até ${MAX_LOYALTY_DAYS} dias depois dele.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM jogadores WHERE id = ${playerId} FOR UPDATE`;
      await tx.$executeRaw`SELECT 1 FROM clubes WHERE id = ${dto.club_id} FOR UPDATE`;

      const player = await findActivePlayerOrThrow(
        tx,
        playerId,
        playerMarketSelect,
      );
      const club = await tx.club.findUnique({
        where: { id: dto.club_id },
        select: { cash: true, _count: { select: { players: true } } },
      });

      if (!club) {
        throw new NotFoundException(CLUB_NOT_FOUND);
      }
      if (player.clubId !== null) {
        throw new ConflictException(
          'O jogador não está livre. Só jogadores sem clube podem ser comprados.',
        );
      }

      const soldBefore = await tx.transaction.findFirst({
        where: {
          clubId: dto.club_id,
          playerId,
          type: TransactionType.VENDA,
        },
        select: { id: true },
      });
      if (soldBefore) {
        throw new ConflictException(
          'O clube não pode recomprar um jogador que ele mesmo vendeu.',
        );
      }
      if (club._count.players >= MAX_SQUAD_SIZE) {
        throw new ConflictException(
          `O elenco do clube já tem ${MAX_SQUAD_SIZE} jogadores, o máximo permitido.`,
        );
      }

      const marketValue = calculateMarketValue({
        baseValue: player.baseValue,
        condition: player.condition as Condition,
        agility: player.agility,
        age: player.age,
      });
      const fee = calculatePurchaseFee(marketValue);
      const cost = marketValue.plus(fee);

      if (!isWithinCashLimit(cost, club.cash)) {
        throw new ConflictException(
          `O custo total (${cost.toFixed(2)}) passa de 50% do caixa do clube (${club.cash.dividedBy(2).toString()}).`,
        );
      }

      const updatedClub = await tx.club.update({
        where: { id: dto.club_id },
        data: { cash: { decrement: cost } },
        select: { cash: true },
      });
      await tx.player.update({
        where: { id: playerId },
        data: { clubId: dto.club_id },
      });
      const contract = await tx.contract.create({
        data: {
          playerId,
          clubId: dto.club_id,
          purchaseValue: marketValue,
          loyaltyUntil,
          status: ContractStatus.ATIVO,
          startedAt: now,
        },
        select: contractSelect,
      });
      const transaction = await tx.transaction.create({
        data: {
          clubId: dto.club_id,
          playerId,
          playerName: player.name,
          type: TransactionType.COMPRA,
          value: marketValue,
          fee,
          penalty: 0,
          profit: null,
          cashChange: cost.negated(),
          createdAt: now,
        },
        select: transactionSelect,
      });

      return toMarketOperationResponse(transaction, contract, updatedClub.cash);
    });
  }
}
