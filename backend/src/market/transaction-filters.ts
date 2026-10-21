import { TransactionType } from '../common/enums/transaction-type.enum';

function isTransactionType(value: string): value is TransactionType {
  return Object.values<string>(TransactionType).includes(value);
}

export function parseTransactionTypes(
  value: string,
): TransactionType[] | undefined {
  const types = value.split(',');

  if (!types.every(isTransactionType) || new Set(types).size !== types.length) {
    return undefined;
  }
  return types;
}
