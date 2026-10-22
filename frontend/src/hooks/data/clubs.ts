'use client';

import { clubsService } from '@/lib/api/services/clubs';
import type { ListClubsQuery } from '@/lib/api/types/club';
import { useApiQuery } from '../use-api-query';

export function useClubs(query: ListClubsQuery = {}) {
  return useApiQuery(['clubs', query], () => clubsService.list(query));
}

export function useClub(id: number) {
  return useApiQuery(['club', id], () => clubsService.get(id));
}
