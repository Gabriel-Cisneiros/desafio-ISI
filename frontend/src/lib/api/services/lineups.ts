import { api } from '../client';
import type { Lineup, UpdateLineupBody } from '../types/league';

export const lineupsService = {
  async get(clubId: number): Promise<Lineup> {
    const { data } = await api.get<Lineup>(`/clubs/${clubId}/lineup`);
    return data;
  },

  async update(clubId: number, body: UpdateLineupBody): Promise<Lineup> {
    const { data } = await api.put<Lineup>(`/clubs/${clubId}/lineup`, body);
    return data;
  },
};
