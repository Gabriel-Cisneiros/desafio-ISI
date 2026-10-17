const BRAZIL_OFFSET_HOURS = 3;
const MS_PER_HOUR = 60 * 60 * 1000;
const INPUT_FORMAT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function parseBrazilDateTime(value: string): Date | undefined {
  const match = INPUT_FORMAT.exec(value);
  if (!match) {
    return undefined;
  }

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month) ||
    hour > 23 ||
    minute > 59
  ) {
    return undefined;
  }

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour + BRAZIL_OFFSET_HOURS, minute, 0, 0);
  return date;
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

export function formatBrazilDateTime(date: Date): string {
  const local = new Date(date.getTime() - BRAZIL_OFFSET_HOURS * MS_PER_HOUR);

  return (
    `${pad(local.getUTCFullYear(), 4)}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}` +
    `T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}-03:00`
  );
}
