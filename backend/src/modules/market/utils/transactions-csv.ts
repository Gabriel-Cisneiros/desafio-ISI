import { Prisma } from '@prisma/client';
import { formatBrazilDateTime } from '../../../common/rules/datetime';
import { TransactionRecord } from '../selects/market.select';

export const CSV_HEADER =
  'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';

const SEPARATOR = ';';
const LINE_END = '\n';
const NEEDS_QUOTES = /[;"\r\n]/;

export function formatCsvMoney(value: Prisma.Decimal): string {
  return value.toFixed(2).replace('.', ',');
}

export function escapeCsvText(value: string): string {
  return NEEDS_QUOTES.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function toCsvLine(transaction: TransactionRecord): string {
  return [
    formatBrazilDateTime(transaction.createdAt),
    transaction.type,
    escapeCsvText(transaction.playerName),
    formatCsvMoney(transaction.value),
    formatCsvMoney(transaction.fee),
    formatCsvMoney(transaction.penalty),
    transaction.profit === null ? '' : formatCsvMoney(transaction.profit),
    formatCsvMoney(transaction.cashChange),
  ].join(SEPARATOR);
}

export function toTransactionsCsv(transactions: TransactionRecord[]): string {
  return [CSV_HEADER, ...transactions.map(toCsvLine)]
    .map((line) => line + LINE_END)
    .join('');
}
