export const POSITIONS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const;
export type Position = (typeof POSITIONS)[number];

export const CONDITIONS = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const TRANSACTION_TYPES = ['COMPRA', 'VENDA'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const CONTRACT_STATUSES = ['ATIVO', 'ENCERRADO', 'RESCINDIDO'] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;
export type Formation = (typeof FORMATIONS)[number];

export const MATCH_RESULTS = ['MANDANTE', 'VISITANTE', 'EMPATE'] as const;
export type MatchResult = (typeof MATCH_RESULTS)[number];

export const PLAYER_SORTS = [
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
] as const;
export type PlayerSort = (typeof PLAYER_SORTS)[number];

export const CLUB_SORTS = ['name', 'net_worth_asc', 'net_worth_desc'] as const;
export type ClubSort = (typeof CLUB_SORTS)[number];

export type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending';
