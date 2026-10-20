import { Position } from '../common/enums/position.enum';
import { compareByNameAndId, compareNames } from '../common/rules/text';
import { PlayerResponse } from './interfaces/player.interface';

export enum PlayerSort {
  NAME = 'name',
  VALUE_ASC = 'value_asc',
  VALUE_DESC = 'value_desc',
  AGE_ASC = 'age_asc',
  AGE_DESC = 'age_desc',
  POSITION = 'position',
}

export const DEFAULT_PLAYER_SORT = [PlayerSort.NAME];
const MAX_SORT_CRITERIA = 2;

const SORT_FIELD: Record<PlayerSort, string> = {
  [PlayerSort.NAME]: 'name',
  [PlayerSort.VALUE_ASC]: 'value',
  [PlayerSort.VALUE_DESC]: 'value',
  [PlayerSort.AGE_ASC]: 'age',
  [PlayerSort.AGE_DESC]: 'age',
  [PlayerSort.POSITION]: 'position',
};

function isPlayerSort(value: string): value is PlayerSort {
  return Object.values<string>(PlayerSort).includes(value);
}

export function parsePlayerSort(value: string): PlayerSort[] | undefined {
  const criteria = value.split(',');

  if (criteria.length > MAX_SORT_CRITERIA || !criteria.every(isPlayerSort)) {
    return undefined;
  }

  const fields = new Set(criteria.map((criterion) => SORT_FIELD[criterion]));
  return fields.size === criteria.length ? criteria : undefined;
}

const POSITION_ORDER = Object.values(Position);

type PlayerComparator = (a: PlayerResponse, b: PlayerResponse) => number;

const COMPARATORS: Record<PlayerSort, PlayerComparator> = {
  [PlayerSort.NAME]: (a, b) => compareNames(a.name, b.name),
  [PlayerSort.VALUE_ASC]: (a, b) => a.market_value - b.market_value,
  [PlayerSort.VALUE_DESC]: (a, b) => b.market_value - a.market_value,
  [PlayerSort.AGE_ASC]: (a, b) => a.age - b.age,
  [PlayerSort.AGE_DESC]: (a, b) => b.age - a.age,
  [PlayerSort.POSITION]: (a, b) =>
    POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position),
};

export function comparePlayersBy(sort: PlayerSort[]): PlayerComparator {
  return (a, b) => {
    for (const criterion of sort) {
      const result = COMPARATORS[criterion](a, b);
      if (result !== 0) {
        return result;
      }
    }
    return compareByNameAndId(a, b);
  };
}
