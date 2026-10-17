import { Prisma } from '@prisma/client';
import { roundMoney } from './money';

describe('roundMoney', () => {
  it.each([
    ['14.775', '14.78'],
    ['0.385', '0.39'],
    ['8.7875', '8.79'],
    ['1.5005', '1.50'],
    ['130.574', '130.57'],
    ['40', '40.00'],
  ])('arredonda %s para %s', (value, expected) => {
    expect(roundMoney(value).toFixed(2)).toBe(expected);
  });

  it('arredonda o meio para longe do zero também em negativos', () => {
    expect(roundMoney('-0.385').toFixed(2)).toBe('-0.39');
  });

  it('não sofre erro de ponto flutuante', () => {
    expect(roundMoney(new Prisma.Decimal('1.005')).toFixed(2)).toBe('1.01');
    expect(roundMoney(new Prisma.Decimal('0.1').plus('0.2')).toFixed(2)).toBe(
      '0.30',
    );
  });
});
