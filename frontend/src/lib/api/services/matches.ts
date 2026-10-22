import { api } from '../client';
import type {
  CreateMatchBody,
  ListMatchesQuery,
  Match,
  MatchDetails,
} from '../types/league';

export const matchesService = {
  async list(query: ListMatchesQuery = {}): Promise<Match[]> {
    const { data } = await api.get<Match[]>('/matches', { params: query });
    return data;
  },

  async get(id: number): Promise<MatchDetails> {
    const { data } = await api.get<MatchDetails>(`/matches/${id}`);
    return data;
  },

  async create(body: CreateMatchBody): Promise<MatchDetails> {
    const { data } = await api.post<MatchDetails>('/matches', body);
    return data;
  },
};
