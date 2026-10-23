'use client';

import { lineupsService } from '@/lib/api/services/lineups';
import { matchesService } from '@/lib/api/services/matches';
import { standingsService } from '@/lib/api/services/standings';
import type { ListMatchesQuery } from '@/lib/api/types/league';
import { useApiQuery } from '../use-api-query';

export function useLineup(clubId: number | null) {
  return useApiQuery(
    ['lineup', clubId],
    () => lineupsService.get(clubId!),
    clubId !== null,
  );
}

export function useMatches(query: ListMatchesQuery = {}) {
  return useApiQuery(['matches', query], () => matchesService.list(query));
}

export function useMatch(id: number | undefined) {
  return useApiQuery(
    ['match', id],
    () => matchesService.get(id!),
    id !== undefined,
  );
}

export function useStandings() {
  return useApiQuery(['standings'], () => standingsService.list());
}
