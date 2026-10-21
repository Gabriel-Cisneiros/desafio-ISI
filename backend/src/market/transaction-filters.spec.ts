import { TransactionType } from '../common/enums/transaction-type.enum';
import { parseTransactionTypes } from './transaction-filters';

describe('parseTransactionTypes', () => {
  it.each([
    ['COMPRA', [TransactionType.COMPRA]],
    ['VENDA', [TransactionType.VENDA]],
    ['COMPRA,VENDA', [TransactionType.COMPRA, TransactionType.VENDA]],
    ['VENDA,COMPRA', [TransactionType.VENDA, TransactionType.COMPRA]],
  ])('aceita %s', (value, expected) => {
    expect(parseTransactionTypes(value)).toEqual(expected);
  });

  it.each([
    ['vazio', ''],
    ['minúsculas', 'compra'],
    ['maiúsculas trocadas', 'COMPRA,venda'],
    ['repetição', 'COMPRA,COMPRA'],
    ['espaço', 'COMPRA, VENDA'],
    ['vírgula sobrando', 'COMPRA,'],
    ['valor fora da lista', 'TROCA'],
  ])('recusa %s', (_, value) => {
    expect(parseTransactionTypes(value)).toBeUndefined();
  });
});
