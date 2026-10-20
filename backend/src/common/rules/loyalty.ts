export const MAX_LOYALTY_DAYS = 1095;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isValidLoyaltyEnd(loyaltyUntil: Date, now: Date): boolean {
  const end = loyaltyUntil.getTime();
  return (
    end > now.getTime() && end <= now.getTime() + MAX_LOYALTY_DAYS * MS_PER_DAY
  );
}
