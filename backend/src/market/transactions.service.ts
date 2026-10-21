import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ensureClubExists } from '../clubs/existing-club';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { roundMoney } from '../common/rules/money';
import { findActivePlayerOrThrow } from '../players/active-player';
import { PrismaService } from '../prisma/prisma.service';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import {
  TransactionHistoryResponse,
  TransactionSummary,
} from './interfaces/transaction.interface';
import { toTransactionResponse } from './market.mapper';
import { TransactionRecord, transactionSelect } from './market.select';
import { toTransactionsCsv } from './transactions-csv';

function summarize(transactions: TransactionRecord[]): TransactionSummary {
  const zero = new Prisma.Decimal(0);
  const totals = {
    spent: zero,
    received: zero,
    fees: zero,
    penalties: zero,
    profit: zero,
  };

  for (const transaction of transactions) {
    totals.fees = totals.fees.plus(transaction.fee);
    if ((transaction.type as TransactionType) === TransactionType.COMPRA) {
      totals.spent = totals.spent.plus(transaction.value).plus(transaction.fee);
    } else {
      totals.received = totals.received.plus(transaction.cashChange);
      totals.penalties = totals.penalties.plus(transaction.penalty);
      totals.profit = totals.profit.plus(transaction.profit ?? 0);
    }
  }

  return {
    total_spent: roundMoney(totals.spent).toNumber(),
    total_received: roundMoney(totals.received).toNumber(),
    total_fees: roundMoney(totals.fees).toNumber(),
    total_penalties: roundMoney(totals.penalties).toNumber(),
    total_profit: roundMoney(totals.profit).toNumber(),
  };
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findFiltered(
    clubId: number,
    query: ListTransactionsQueryDto,
  ): Promise<TransactionRecord[]> {
    await ensureClubExists(this.prisma, clubId);
    if (query.player_id !== undefined) {
      await findActivePlayerOrThrow(this.prisma, query.player_id, {
        id: true,
      });
    }

    return this.prisma.transaction.findMany({
      where: {
        clubId,
        playerId: query.player_id,
        type: query.type ? { in: query.type } : undefined,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: transactionSelect,
    });
  }

  async history(
    clubId: number,
    query: ListTransactionsQueryDto,
  ): Promise<TransactionHistoryResponse> {
    const transactions = await this.findFiltered(clubId, query);
    return {
      data: transactions.map(toTransactionResponse),
      summary: summarize(transactions),
    };
  }

  async exportCsv(
    clubId: number,
    query: ListTransactionsQueryDto,
  ): Promise<string> {
    return toTransactionsCsv(await this.findFiltered(clubId, query));
  }
}
