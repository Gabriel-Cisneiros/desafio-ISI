import { api } from '../client';
import type { Condition } from '../types/enums';
import type {
  CreatePlayerBody,
  ListPlayersQuery,
  Paginated,
  Player,
  UpdatePlayerBody,
} from '../types/player';

export const playersService = {
  async list(query: ListPlayersQuery = {}): Promise<Paginated<Player>> {
    const { data } = await api.get<Paginated<Player>>('/players', {
      params: query,
    });
    return data;
  },

  async get(id: number): Promise<Player> {
    const { data } = await api.get<Player>(`/players/${id}`);
    return data;
  },

  async create(body: CreatePlayerBody): Promise<Player> {
    const { data } = await api.post<Player>('/players', body);
    return data;
  },

  async update(id: number, body: UpdatePlayerBody): Promise<Player> {
    const { data } = await api.put<Player>(`/players/${id}`, body);
    return data;
  },

  async updateCondition(id: number, condition: Condition): Promise<Player> {
    const { data } = await api.patch<Player>(`/players/${id}/condition`, {
      condition,
    });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/players/${id}`);
  },
};
