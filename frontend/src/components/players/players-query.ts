import {
  CONDITIONS,
  type Condition,
  PLAYER_SORTS,
  POSITIONS,
  type PlayerSort,
  type Position,
} from '@/lib/api/types/enums';
import type { ListPlayersQuery } from '@/lib/api/types/player';

export const PAGE_SIZE = 10;
export const SEARCH_MIN_LENGTH = 2;
export const AGE_RANGE = { min: 16, max: 45 };
export const VALUE_RANGE = { min: 0, max: 550 };

export type PlayersTab = 'all' | 'free' | 'in-clubs';

export interface PlayersFilters {
  search: string;
  position?: Position;
  condition?: Condition;
  clubId?: number;
  minAge?: number;
  maxAge?: number;
  minValue?: number;
  maxValue?: number;
  tab: PlayersTab;
  sort: PlayerSort;
  page: number;
}

export const SORT_LABELS: Record<PlayerSort, string> = {
  name: 'Nome',
  value_desc: 'Maior valor de mercado',
  value_asc: 'Menor valor de mercado',
  age_desc: 'Maior idade',
  age_asc: 'Menor idade',
  position: 'Posição (GOL a ATA)',
};

const TABS: PlayersTab[] = ['all', 'free', 'in-clubs'];

function readEnum<T extends string>(
  values: readonly T[],
  value: string | null,
): T | undefined {
  return values.find((item) => item === value);
}

function readNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function readFilters(params: URLSearchParams): PlayersFilters {
  return {
    search: params.get('search') ?? '',
    position: readEnum(POSITIONS, params.get('position')),
    condition: readEnum(CONDITIONS, params.get('condition')),
    clubId: readNumber(params.get('club_id')),
    minAge: readNumber(params.get('min_age')),
    maxAge: readNumber(params.get('max_age')),
    minValue: readNumber(params.get('min_value')),
    maxValue: readNumber(params.get('max_value')),
    tab: readEnum(TABS, params.get('tab')) ?? 'all',
    sort: readEnum(PLAYER_SORTS, params.get('sort')) ?? 'name',
    page: Math.max(1, Math.trunc(readNumber(params.get('page')) ?? 1)),
  };
}

export function writeFilters(filters: PlayersFilters): URLSearchParams {
  const params = new URLSearchParams();
  const entries: [string, string | number | undefined][] = [
    ['search', filters.search || undefined],
    ['position', filters.position],
    ['condition', filters.condition],
    ['club_id', filters.clubId],
    ['min_age', filters.minAge],
    ['max_age', filters.maxAge],
    ['min_value', filters.minValue],
    ['max_value', filters.maxValue],
    ['tab', filters.tab === 'all' ? undefined : filters.tab],
    ['sort', filters.sort === 'name' ? undefined : filters.sort],
    ['page', filters.page === 1 ? undefined : filters.page],
  ];
  for (const [key, value] of entries) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }
  return params;
}

export function apiSearch(search: string): string | undefined {
  const trimmed = search.trim();
  return trimmed.length >= SEARCH_MIN_LENGTH ? trimmed : undefined;
}

const FREE_BY_TAB: Record<PlayersTab, boolean | undefined> = {
  all: undefined,
  free: true,
  'in-clubs': false,
};

export function baseQuery(filters: PlayersFilters): ListPlayersQuery {
  return {
    search: apiSearch(filters.search),
    position: filters.position,
    condition: filters.condition,
    club_id: filters.clubId,
    min_age: filters.minAge,
    max_age: filters.maxAge,
    min_value: filters.minValue,
    max_value: filters.maxValue,
  };
}

export function listQuery(filters: PlayersFilters): ListPlayersQuery {
  return {
    ...baseQuery(filters),
    free: FREE_BY_TAB[filters.tab],
    sort: filters.sort,
    page: filters.page,
    limit: PAGE_SIZE,
  };
}

export function countQuery(
  filters: PlayersFilters,
  tab: PlayersTab,
): ListPlayersQuery {
  return { ...baseQuery(filters), free: FREE_BY_TAB[tab], limit: 1 };
}
