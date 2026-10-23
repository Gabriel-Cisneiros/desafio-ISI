import type {
  Condition,
  DuelAttribute,
  MatchResult,
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

export const MATCH_RESULT_LABELS: Record<MatchResult, string> = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
};

export const DUEL_ATTRIBUTE_LABELS: Record<DuelAttribute, string> = {
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
};

export const DUEL_ATTRIBUTE_SHORT_LABELS: Record<DuelAttribute, string> = {
  shooting: 'Fin',
  passing: 'Pas',
  dribbling: 'Dri',
  defending: 'Def',
};
