export const MAX_LOYALTY_DAYS = 1095;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isValidLoyaltyEnd(loyaltyUntil: Date, now: Date): boolean {
  const end = loyaltyUntil.getTime();
  return (
    end > now.getTime() && end <= now.getTime() + MAX_LOYALTY_DAYS * MS_PER_DAY
  );
}

export function calculateRemainingDays(loyaltyUntil: Date, now: Date): number {
  return Math.max(
    0,
    Math.ceil((loyaltyUntil.getTime() - now.getTime()) / MS_PER_DAY),
  );
}

export function calculatePenaltyRate(remainingDays: number): number {
  if (remainingDays === 0) {
    return 0;
  }
  if (remainingDays <= 30) {
    return 5;
  }
  if (remainingDays <= 180) {
    return 10;
  }
  return 20;
}
