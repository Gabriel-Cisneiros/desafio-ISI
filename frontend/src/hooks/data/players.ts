'use client';

import { playersService } from '@/lib/api/services/players';
import type { ListPlayersQuery } from '@/lib/api/types/player';
import { useApiQuery } from '../use-api-query';

export function usePlayers(query: ListPlayersQuery) {
  return useApiQuery(['players', query], () => playersService.list(query));
}

export function usePlayer(id: number) {
  return useApiQuery(['player', id], () => playersService.get(id));
}
