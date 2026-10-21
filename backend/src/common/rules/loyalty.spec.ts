import {
  MAX_LOYALTY_DAYS,
  calculatePenaltyRate,
  calculateRemainingDays,
  isValidLoyaltyEnd,
} from './loyalty';

describe('isValidLoyaltyEnd', () => {
  const now = new Date('2026-11-02T13:15:00Z');
  const daysAfter = (days: number, extraMs = 0) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000 + extraMs);

  it.each([
    ['um minuto depois', daysAfter(0, 60_000)],
    [`exatamente ${MAX_LOYALTY_DAYS} dias depois`, daysAfter(MAX_LOYALTY_DAYS)],
  ])('aceita %s', (_, until) => {
    expect(isValidLoyaltyEnd(until, now)).toBe(true);
  });

  it.each([
    ['o próprio momento', now],
    ['no passado', daysAfter(-1)],
    ['um minuto além do limite', daysAfter(MAX_LOYALTY_DAYS, 60_000)],
  ])('recusa %s', (_, until) => {
    expect(isValidLoyaltyEnd(until, now)).toBe(false);
  });
});

describe('dias restantes e percentual de multa', () => {
  const now = new Date('2026-11-05T19:40:00Z');
  const HOUR = 60 * 60 * 1000;
  const MINUTE = 60 * 1000;
  const after = (ms: number) => new Date(now.getTime() + ms);

  it.each([
    ['já passou', after(-HOUR), 0, 0],
    ['é o próprio momento', now, 0, 0],
    ['10 dias e 2 horas', after(10 * 24 * HOUR + 2 * HOUR), 11, 5],
    ['exatamente 30 dias', after(30 * 24 * HOUR), 30, 5],
    ['30 dias e 1 minuto', after(30 * 24 * HOUR + MINUTE), 31, 10],
    ['exatamente 180 dias', after(180 * 24 * HOUR), 180, 10],
    ['180 dias e 1 minuto', after(180 * 24 * HOUR + MINUTE), 181, 20],
    ['200 dias', after(200 * 24 * HOUR), 200, 20],
    [
      '116 dias, 17 horas e 35 minutos',
      after(116 * 24 * HOUR + 17 * HOUR + 35 * MINUTE),
      117,
      10,
    ],
  ])('%s: %i dias, %i%%', (_, loyaltyUntil, days, rate) => {
    const remaining = calculateRemainingDays(loyaltyUntil, now);

    expect(remaining).toBe(days);
    expect(calculatePenaltyRate(remaining)).toBe(rate);
  });
});
