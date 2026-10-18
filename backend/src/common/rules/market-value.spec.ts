import { Condition } from '../enums/condition.enum';
import { calculateMarketValue } from './market-value';

describe('calculateMarketValue', () => {
  it.each([
    ['82.00', Condition.APTO, 20, 25, '82.00'],
    ['82.00', Condition.APTO, 50, 19, '90.20'],
    ['82.00', Condition.MAL_CONDICIONADO, 50, 25, '69.70'],
    ['82.00', Condition.MAL_CONDICIONADO, 80, 21, '84.05'],
    ['82.00', Condition.MAL_CONDICIONADO, 30, 33, '53.30'],
    ['82.00', Condition.DOENTE, 90, 25, '69.70'],
    ['82.00', Condition.DOENTE, 30, 25, '49.20'],
    ['82.00', Condition.DOENTE, 10, 40, '49.20'],
    ['9.50', Condition.MAL_CONDICIONADO, 85, 25, '8.79'],
    ['1.00', Condition.MAL_CONDICIONADO, 50, 35, '1.00'],
  ])(
    'valor base %s, %s, agilidade %i, idade %i → %s',
    (baseValue, condition, agility, age, expected) => {
      expect(
        calculateMarketValue({ baseValue, condition, agility, age }).toFixed(2),
      ).toBe(expected);
    },
  );

  it.each([
    [79, '69.70'],
    [31, '69.70'],
  ])(
    'agilidade %i fica fora das faixas que alteram o desconto',
    (agility, expected) => {
      expect(
        calculateMarketValue({
          baseValue: '82.00',
          condition: Condition.MAL_CONDICIONADO,
          agility,
          age: 25,
        }).toFixed(2),
      ).toBe(expected);
    },
  );

  it.each([
    [21, '90.20'],
    [22, '82.00'],
    [31, '82.00'],
    [32, '73.80'],
  ])('idade %i nos limites das faixas do ajuste', (age, expected) => {
    expect(
      calculateMarketValue({
        baseValue: '82.00',
        condition: Condition.APTO,
        agility: 50,
        age,
      }).toFixed(2),
    ).toBe(expected);
  });
});
