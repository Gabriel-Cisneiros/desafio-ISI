import { compareByNameAndId } from '../common/rules/text';
import { ClubResponse } from './interfaces/club.interface';

export enum ClubSort {
  NAME = 'name',
  NET_WORTH_ASC = 'net_worth_asc',
  NET_WORTH_DESC = 'net_worth_desc',
}

type ClubComparator = (a: ClubResponse, b: ClubResponse) => number;

const COMPARATORS: Record<ClubSort, ClubComparator> = {
  [ClubSort.NAME]: () => 0,
  [ClubSort.NET_WORTH_ASC]: (a, b) => a.net_worth - b.net_worth,
  [ClubSort.NET_WORTH_DESC]: (a, b) => b.net_worth - a.net_worth,
};

export function compareClubsBy(sort: ClubSort): ClubComparator {
  return (a, b) => COMPARATORS[sort](a, b) || compareByNameAndId(a, b);
}
