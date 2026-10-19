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
