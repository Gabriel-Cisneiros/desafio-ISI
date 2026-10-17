import { Prisma } from '@prisma/client';

export type Money = Prisma.Decimal;

export function roundMoney(value: Prisma.Decimal.Value): Money {
  return new Prisma.Decimal(value).toDecimalPlaces(
    2,
    Prisma.Decimal.ROUND_HALF_UP,
  );
}
