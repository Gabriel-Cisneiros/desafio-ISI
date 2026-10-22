'use client';

import { marketService } from '@/lib/api/services/market';
import type { ListTransactionsQuery } from '@/lib/api/types/market';
import { useApiQuery } from '../use-api-query';

export function useTransactions(clubId: number, query: ListTransactionsQuery) {
  return useApiQuery(['transactions', clubId, query], () =>
    marketService.history(clubId, query),
  );
}
