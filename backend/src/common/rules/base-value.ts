import { Prisma } from '@prisma/client';
import { Money, roundMoney } from './money';

const OVERALL_BANDS = [
  { from: 41, to: 60, perPoint: '0.50' },
  { from: 61, to: 75, perPoint: '2.00' },
  { from: 76, to: 99, perPoint: '6.00' },
];

const YOUNG_PROSPECT_MAX_AGE = 21;
const MIN_BASE_VALUE = new Prisma.Decimal('1.00');

export interface BaseValueInput {
  overall: number;
  potential: number;
  age: number;
}

function overallPart(overall: number): Prisma.Decimal {
  return OVERALL_BANDS.reduce((total, { from, to, perPoint }) => {
    const points = Math.max(0, Math.min(overall, to) - from + 1);
    return total.plus(new Prisma.Decimal(perPoint).times(points));
  }, new Prisma.Decimal(0));
}

export function calculateBaseValue({
  overall,
  potential,
  age,
}: BaseValueInput): Money {
  let value = overallPart(overall);

  if (age <= YOUNG_PROSPECT_MAX_AGE) {
    value = value.times(100 + potential - overall).dividedBy(100);
  }

  return Prisma.Decimal.max(roundMoney(value), MIN_BASE_VALUE);
}
