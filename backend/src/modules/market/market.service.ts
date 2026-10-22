import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CLUB_NOT_FOUND } from '../clubs/utils/existing-club';
import { Condition } from '../../common/enums/condition.enum';
import { ContractStatus } from '../../common/enums/contract-status.enum';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import { parseBrazilDateTime } from '../../common/rules/datetime';
import {
  MAX_LOYALTY_DAYS,
  calculatePenaltyRate,
  calculateRemainingDays,
  isValidLoyaltyEnd,
} from '../../common/rules/loyalty';
import { calculateMarketValue } from '../../common/rules/market-value';
import {
  calculatePurchaseFee,
  isWithinCashLimit,
} from '../../common/rules/purchase';
import { calculateCommission, calculatePenalty } from '../../common/rules/sale';
import { findActivePlayerOrThrow } from '../players/utils/active-player';
import { playerMarketSelect } from '../players/selects/players.select';
import { PrismaService } from '../../prisma/prisma.service';
import { BuyPlayerDto } from './dto/buy-player.dto';
import {
  MarketOperationResponse,
  SaleResponse,
} from './interfaces/transaction.interface';
import {
  toMarketOperationResponse,
  toSaleResponse,
} from './mappers/market.mapper';
import { contractSelect, transactionSelect } from './selects/market.select';
import { fieldLabel } from '../../common/validators/field-labels';

export const MAX_SQUAD_SIZE = 12;

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  buy(playerId: number, dto: BuyPlayerDto): Promise<MarketOperationResponse> {
    const now = new Date();
    const loyaltyUntil = parseBrazilDateTime(dto.loyalty_until)!;

    if (!isValidLoyaltyEnd(loyaltyUntil, now)) {
      throw new BadRequestException(
        `O campo ${fieldLabel('loyalty_until')} deve ser depois do momento da compra e até ${MAX_LOYALTY_DAYS} dias depois dele.`,
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

  sell(playerId: number): Promise<SaleResponse> {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM jogadores WHERE id = ${playerId} FOR UPDATE`;

      const player = await findActivePlayerOrThrow(
        tx,
        playerId,
        playerMarketSelect,
      );
      if (player.clubId === null) {
        throw new ConflictException(
          'O jogador está livre. Só jogadores de um clube podem ser vendidos.',
        );
      }
      const clubId = player.clubId;
      await tx.$executeRaw`SELECT 1 FROM clubes WHERE id = ${clubId} FOR UPDATE`;

      const contract = await tx.contract.findFirst({
        where: { playerId, clubId, status: ContractStatus.ATIVO },
        select: { id: true, purchaseValue: true, loyaltyUntil: true },
      });
      if (!contract) {
        throw new ConflictException(
          'O jogador não tem contrato ativo com o clube.',
        );
      }

      const marketValue = calculateMarketValue({
        baseValue: player.baseValue,
        condition: player.condition as Condition,
        agility: player.agility,
        age: player.age,
      });
      const remainingDays = calculateRemainingDays(contract.loyaltyUntil, now);
      const penaltyRate = calculatePenaltyRate(remainingDays);
      const penalty = calculatePenalty(marketValue, penaltyRate);
      const profit = marketValue.minus(contract.purchaseValue);
      const commission = calculateCommission(profit);
      const credit = marketValue.minus(penalty).minus(commission);
      const contractStatus = penalty.greaterThan(0)
        ? ContractStatus.RESCINDIDO
        : ContractStatus.ENCERRADO;

      const club = await tx.club.update({
        where: { id: clubId },
        data: { cash: { increment: credit } },
        select: { cash: true },
      });
      await tx.lineupEntry.deleteMany({ where: { playerId } });
      await tx.player.update({
        where: { id: playerId },
        data: { clubId: null },
      });
      await tx.contract.update({
        where: { id: contract.id },
        data: { status: contractStatus, endedAt: now },
      });
      const transaction = await tx.transaction.create({
        data: {
          clubId,
          playerId,
          playerName: player.name,
          type: TransactionType.VENDA,
          value: marketValue,
          fee: commission,
          penalty,
          profit,
          cashChange: credit,
          createdAt: now,
        },
        select: transactionSelect,
      });

      return toSaleResponse(transaction, {
        purchaseValue: contract.purchaseValue,
        remainingDays,
        penaltyRate,
        contractStatus,
        clubCash: club.cash,
      });
    });
  }
}
