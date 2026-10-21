import { Prisma } from '@prisma/client';
import { Money, roundMoney } from './money';

const MAX_PENALTY = new Prisma.Decimal('10.00');
const COMMISSION_FIRST_BAND = new Prisma.Decimal('10.00');
const COMMISSION_FIRST_RATE = new Prisma.Decimal('0.10');
const COMMISSION_SECOND_RATE = new Prisma.Decimal('0.20');

export function calculatePenalty(
  marketValue: Prisma.Decimal.Value,
  penaltyRate: number,
): Money {
  const penalty = roundMoney(
    new Prisma.Decimal(marketValue).times(penaltyRate).dividedBy(100),
  );
  return Prisma.Decimal.min(penalty, MAX_PENALTY);
}

export function calculateCommission(profit: Prisma.Decimal.Value): Money {
  const value = new Prisma.Decimal(profit);
  if (value.lessThanOrEqualTo(0)) {
    return roundMoney(0);
  }

  const firstBand = Prisma.Decimal.min(value, COMMISSION_FIRST_BAND);
  const secondBand = Prisma.Decimal.max(value.minus(COMMISSION_FIRST_BAND), 0);
  return roundMoney(
    firstBand
      .times(COMMISSION_FIRST_RATE)
      .plus(secondBand.times(COMMISSION_SECOND_RATE)),
  );
}
