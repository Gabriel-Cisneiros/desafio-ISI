import { Prisma } from '@prisma/client';
import { ContractStatus } from '../common/enums/contract-status.enum';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { formatBrazilDateTime } from '../common/rules/datetime';
import {
  ContractSummary,
  MarketOperationResponse,
  TransactionResponse,
} from './interfaces/transaction.interface';
import { ContractRecord, TransactionRecord } from './market.select';

export function toTransactionResponse(
  transaction: TransactionRecord,
): TransactionResponse {
  return {
    id: transaction.id,
    club_id: transaction.clubId,
    player_id: transaction.playerId,
    player_name: transaction.playerName,
    type: transaction.type as TransactionType,
    value: transaction.value.toNumber(),
    fee: transaction.fee.toNumber(),
    penalty: transaction.penalty.toNumber(),
    profit: transaction.profit?.toNumber() ?? null,
    cash_change: transaction.cashChange.toNumber(),
    created_at: formatBrazilDateTime(transaction.createdAt),
  };
}

export function toContractSummary(contract: ContractRecord): ContractSummary {
  return {
    purchase_value: contract.purchaseValue.toNumber(),
    loyalty_until: formatBrazilDateTime(contract.loyaltyUntil),
    status: contract.status as ContractStatus,
  };
}

export function toMarketOperationResponse(
  transaction: TransactionRecord,
  contract: ContractRecord,
  clubCash: Prisma.Decimal,
): MarketOperationResponse {
  return {
    ...toTransactionResponse(transaction),
    contract: toContractSummary(contract),
    club_cash: clubCash.toNumber(),
  };
}
