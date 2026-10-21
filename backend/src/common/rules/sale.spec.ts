import { Prisma } from '@prisma/client';
import { calculateCommission, calculatePenalty } from './sale';

describe('calculateCommission', () => {
  it.each([
    ['3.00', '0.30'],
    ['3.85', '0.39'],
    ['10.00', '1.00'],
    ['10.01', '1.00'],
    ['15.00', '2.00'],
    ['0.00', '0.00'],
    ['-7.50', '0.00'],
  ])('lucro %s → comissão %s', (profit, commission) => {
    expect(calculateCommission(profit).toFixed(2)).toBe(commission);
  });
});

describe('venda', () => {
  it.each([
    ['37.00', '40.00', 10, '4.00', '3.00', '0.30', '35.70'],
    ['50.00', '42.50', 20, '8.50', '-7.50', '0.00', '34.00'],
    ['26.15', '30.00', 5, '1.50', '3.85', '0.39', '28.11'],
    ['25.00', '25.00', 0, '0.00', '0.00', '0.00', '25.00'],
    ['60.00', '75.00', 20, '10.00', '15.00', '2.00', '63.00'],
  ])(
    'compra %s, venda %s a %i%%: multa %s, lucro %s, comissão %s, crédito %s',
    (purchase, sale, rate, penalty, profit, commission, credit) => {
      const calculatedPenalty = calculatePenalty(sale, rate);
      const calculatedProfit = new Prisma.Decimal(sale).minus(purchase);
      const calculatedCommission = calculateCommission(calculatedProfit);

      expect(calculatedPenalty.toFixed(2)).toBe(penalty);
      expect(calculatedProfit.toFixed(2)).toBe(profit);
      expect(calculatedCommission.toFixed(2)).toBe(commission);
      expect(
        new Prisma.Decimal(sale)
          .minus(calculatedPenalty)
          .minus(calculatedCommission)
          .toFixed(2),
      ).toBe(credit);
    },
  );
});
