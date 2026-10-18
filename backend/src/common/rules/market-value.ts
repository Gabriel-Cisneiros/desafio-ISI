import { Prisma } from '@prisma/client';
import { Condition } from '../enums/condition.enum';
import { Money, roundMoney } from './money';

const CONDITION_DISCOUNT: Record<Condition, number> = {
  [Condition.APTO]: 0,
  [Condition.MAL_CONDICIONADO]: 15,
  [Condition.DOENTE]: 30,
};

const MAX_TOTAL_DISCOUNT = -40;
const MIN_MARKET_VALUE = new Prisma.Decimal('1.00');

export interface MarketValueInput {
  baseValue: Prisma.Decimal.Value;
  condition: Condition;
  agility: number;
  age: number;
}

function conditionDiscount(
  condition: Condition,
  agility: number,
): Prisma.Decimal {
  const discount = new Prisma.Decimal(CONDITION_DISCOUNT[condition]);

  if (condition === Condition.APTO) {
    return discount;
  }
  if (agility >= 80) {
    return discount.dividedBy(2);
  }
  if (agility <= 30) {
    return discount.plus(10);
  }
  return discount;
}

function ageAdjustment(age: number): number {
  if (age <= 21) {
    return 10;
  }
  if (age >= 32) {
    return -10;
  }
  return 0;
}

export function calculateMarketValue({
  baseValue,
  condition,
  agility,
  age,
}: MarketValueInput): Money {
  const totalPercent = Prisma.Decimal.max(
    new Prisma.Decimal(ageAdjustment(age)).minus(
      conditionDiscount(condition, agility),
    ),
    MAX_TOTAL_DISCOUNT,
  );

  const marketValue = roundMoney(
    new Prisma.Decimal(baseValue).times(totalPercent.plus(100)).dividedBy(100),
  );

  return Prisma.Decimal.max(marketValue, MIN_MARKET_VALUE);
}
