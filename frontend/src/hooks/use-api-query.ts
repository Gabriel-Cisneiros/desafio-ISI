'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LOAD_OFFLINE_MESSAGE,
  getErrorMessage,
  getErrorStatus,
} from '@/lib/api/errors';
import { useRefreshStore } from '@/stores/refresh-store';

interface QueryState<T> {
  key: string;
  data?: T;
  error?: string;
  errorStatus?: number;
}

export interface ApiQuery<T> {
  data: T | undefined;
  error: string | undefined;
  errorStatus: number | undefined;
  loading: boolean;
  reload: () => void;
}

export function useApiQuery<T>(
  key: readonly unknown[],
  fetcher: () => Promise<T>,
  enabled = true,
): ApiQuery<T> {
  const [version, setVersion] = useState(0);
  const globalVersion = useRefreshStore((state) => state.version);
  const [state, setState] = useState<QueryState<T>>({ key: '' });
  const fetcherRef = useRef(fetcher);
  const requestKey = `${JSON.stringify(key)}#${version}#${globalVersion}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let active = true;
    fetcherRef.current().then(
      (data) => active && setState({ key: requestKey, data }),
      (error: unknown) =>
        active &&
        setState((previous) => ({
          key: requestKey,
          data: previous.data,
          error: getErrorMessage(error, LOAD_OFFLINE_MESSAGE),
          errorStatus: getErrorStatus(error),
        })),
    );
    return () => {
      active = false;
    };
  }, [requestKey, enabled]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const settled = state.key === requestKey;

  return {
    data: state.data,
    error: settled ? state.error : undefined,
    errorStatus: settled ? state.errorStatus : undefined,
    loading: enabled && !settled,
    reload,
  };
}
