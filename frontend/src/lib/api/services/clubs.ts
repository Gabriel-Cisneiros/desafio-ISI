import { api } from '../client';
import type {
  Club,
  ClubDetails,
  CreateClubBody,
  ListClubsQuery,
} from '../types/club';

export const clubsService = {
  async list(query: ListClubsQuery = {}): Promise<Club[]> {
    const { data } = await api.get<Club[]>('/clubs', { params: query });
    return data;
  },

  async get(id: number): Promise<ClubDetails> {
    const { data } = await api.get<ClubDetails>(`/clubs/${id}`);
    return data;
  },

  async create(body: CreateClubBody): Promise<Club> {
    const { data } = await api.post<Club>('/clubs', body);
    return data;
  },
};
