import { MAX_LOYALTY_DAYS, isValidLoyaltyEnd } from './loyalty';

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
