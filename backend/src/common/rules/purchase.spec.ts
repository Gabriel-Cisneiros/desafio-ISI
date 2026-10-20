import { calculatePurchaseFee, isWithinCashLimit } from './purchase';

describe('compra', () => {
  it.each([
    ['300.00', '28.00', '0.00', true],
    ['300.00', '30.00', '0.00', true],
    ['300.00', '30.01', '1.50', true],
    ['100.00', '47.62', '2.38', true],
    ['100.00', '48.00', '2.40', false],
    ['300.00', '37.00', '1.85', true],
  ])(
    'caixa %s, valor %s: taxa %s, aceita %s',
    (cash, marketValue, fee, accepted) => {
      const calculatedFee = calculatePurchaseFee(marketValue);

      expect(calculatedFee.toFixed(2)).toBe(fee);
      expect(isWithinCashLimit(calculatedFee.plus(marketValue), cash)).toBe(
        accepted,
      );
    },
  );

  it('compara com a metade exata do caixa, sem arredondar o limite', () => {
    expect(isWithinCashLimit('130.58', '261.15')).toBe(false);
    expect(isWithinCashLimit('130.57', '261.15')).toBe(true);
  });
});
