import { Prisma } from '@prisma/client';

export const transactionSelect = {
  id: true,
  clubId: true,
  playerId: true,
  playerName: true,
  type: true,
  value: true,
  fee: true,
  penalty: true,
  profit: true,
  cashChange: true,
  createdAt: true,
} satisfies Prisma.TransactionSelect;

export type TransactionRecord = Prisma.TransactionGetPayload<{
  select: typeof transactionSelect;
}>;

export const contractSelect = {
  purchaseValue: true,
  loyaltyUntil: true,
  status: true,
} satisfies Prisma.ContractSelect;

export type ContractRecord = Prisma.ContractGetPayload<{
  select: typeof contractSelect;
}>;
