import { api } from '../client';
import type { Standing } from '../types/league';

export const standingsService = {
  async list(): Promise<Standing[]> {
    const { data } = await api.get<Standing[]>('/standings');
    return data;
  },
};
