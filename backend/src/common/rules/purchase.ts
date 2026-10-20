import { Prisma } from '@prisma/client';
import { Money, roundMoney } from './money';

const FEE_FREE_LIMIT = new Prisma.Decimal('30.00');
const FEE_RATE = new Prisma.Decimal('0.05');

export function calculatePurchaseFee(marketValue: Prisma.Decimal.Value): Money {
  const value = new Prisma.Decimal(marketValue);
  return value.greaterThan(FEE_FREE_LIMIT)
    ? roundMoney(value.times(FEE_RATE))
    : roundMoney(0);
}

export function isWithinCashLimit(
  cost: Prisma.Decimal.Value,
  cash: Prisma.Decimal.Value,
): boolean {
  return new Prisma.Decimal(cost).times(2).lessThanOrEqualTo(cash);
}
