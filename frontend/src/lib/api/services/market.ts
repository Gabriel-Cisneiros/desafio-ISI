import { api } from '../client';
import type {
  BuyPlayerBody,
  ListTransactionsQuery,
  PurchaseResult,
  SaleResult,
  TransactionHistory,
} from '../types/market';

function transactionParams(query: ListTransactionsQuery) {
  return {
    type: query.type?.length ? query.type.join(',') : undefined,
    player_id: query.player_id,
  };
}

export const marketService = {
  async buy(playerId: number, body: BuyPlayerBody): Promise<PurchaseResult> {
    const { data } = await api.post<PurchaseResult>(
      `/players/${playerId}/buy`,
      body,
    );
    return data;
  },

  async sell(playerId: number): Promise<SaleResult> {
    const { data } = await api.post<SaleResult>(`/players/${playerId}/sell`);
    return data;
  },

  async history(
    clubId: number,
    query: ListTransactionsQuery = {},
  ): Promise<TransactionHistory> {
    const { data } = await api.get<TransactionHistory>(
      `/clubs/${clubId}/transactions`,
      { params: transactionParams(query) },
    );
    return data;
  },

  async exportCsv(
    clubId: number,
    query: ListTransactionsQuery = {},
  ): Promise<string> {
    const { data } = await api.get<string>(
      `/clubs/${clubId}/transactions/export`,
      { params: transactionParams(query), responseType: 'text' },
    );
    return data;
  },
};
