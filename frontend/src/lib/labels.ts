import type {
  Condition,
  Position,
  TransactionType,
} from '@/lib/api/types/enums';

export const POSITION_LABELS: Record<Position, string> = {
  GOL: 'Goleiro',
  ZAG: 'Zagueiro',
  LAT: 'Lateral',
  MEI: 'Meio-campo',
  ATA: 'Atacante',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  APTO: 'Apto',
  MAL_CONDICIONADO: 'Mal condicionado',
  DOENTE: 'Doente',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  COMPRA: 'Compra',
  VENDA: 'Venda',
};
