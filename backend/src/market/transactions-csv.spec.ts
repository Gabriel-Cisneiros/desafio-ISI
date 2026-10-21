import { Prisma } from '@prisma/client';
import { TransactionRecord } from './market.select';
import {
  CSV_HEADER,
  escapeCsvText,
  formatCsvMoney,
  toTransactionsCsv,
} from './transactions-csv';

const decimal = (value: string) => new Prisma.Decimal(value);

function transaction(
  overrides: Partial<TransactionRecord> = {},
): TransactionRecord {
  return {
    id: 1,
    clubId: 1,
    playerId: 1,
    playerName: 'Meia Lua',
    type: 'COMPRA',
    value: decimal('37.00'),
    fee: decimal('1.85'),
    penalty: decimal('0.00'),
    profit: null,
    cashChange: decimal('-38.85'),
    createdAt: new Date('2026-11-02T13:15:00Z'),
    ...overrides,
  };
}

describe('formatCsvMoney', () => {
  it.each([
    ['40', '40,00'],
    ['0.3', '0,30'],
    ['-38.85', '-38,85'],
    ['0', '0,00'],
  ])('formata %s como %s', (value, expected) => {
    expect(formatCsvMoney(decimal(value))).toBe(expected);
  });
});

describe('escapeCsvText', () => {
  it.each([
    ['Meia Lua', 'Meia Lua'],
    ['Zé "Foguete" Lima', '"Zé ""Foguete"" Lima"'],
    ['Ana;Lima', '"Ana;Lima"'],
  ])('escreve %s como %s', (value, expected) => {
    expect(escapeCsvText(value)).toBe(expected);
  });
});

describe('toTransactionsCsv', () => {
  it('sem transações devolve só o cabeçalho com LF', () => {
    expect(toTransactionsCsv([])).toBe(`${CSV_HEADER}\n`);
  });

  it('escreve uma linha por transação, com lucro vazio quando nulo', () => {
    const csv = toTransactionsCsv([
      transaction({
        id: 2,
        type: 'VENDA',
        value: decimal('40.00'),
        fee: decimal('0.30'),
        penalty: decimal('4.00'),
        profit: decimal('3.00'),
        cashChange: decimal('35.70'),
        createdAt: new Date('2026-11-05T19:40:00Z'),
      }),
      transaction(),
    ]);

    expect(csv).toBe(
      `${CSV_HEADER}\n` +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('escreve lucro zero como 0,00', () => {
    const csv = toTransactionsCsv([
      transaction({ type: 'VENDA', profit: decimal('0') }),
    ]);

    expect(csv.split('\n')[1].split(';')[6]).toBe('0,00');
  });
});
