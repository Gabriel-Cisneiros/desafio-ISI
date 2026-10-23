const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const API_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

export function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

export function formatSignedMoney(value: number): string {
  return value > 0 ? `+${formatMoney(value)}` : formatMoney(value);
}

export function splitDateTime(value: string): { date: string; time: string } {
  const match = API_DATE_TIME.exec(value);
  if (!match) {
    return { date: value, time: '' };
  }
  const [, year, month, day, hour, minute] = match;
  return { date: `${day}/${month}/${year}`, time: `${hour}:${minute}` };
}

export function formatDateTime(value: string): string {
  const { date, time } = splitDateTime(value);
  return time ? `${date}, ${time}` : date;
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}
