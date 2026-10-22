'use client';

import { useRef, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { notifyError, notifySuccess } from '@/stores/feedback-store';

interface ApiActionOptions<R> {
  success?: string | ((result: R) => string);
  onSuccess?: (result: R) => void;
}

export interface ApiAction<A extends unknown[], R> {
  run: (...args: A) => Promise<R | undefined>;
  pending: boolean;
}

export function useApiAction<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  options: ApiActionOptions<R> = {},
): ApiAction<A, R> {
  const [pending, setPending] = useState(false);
  const running = useRef(false);

  async function run(...args: A): Promise<R | undefined> {
    if (running.current) {
      return undefined;
    }
    running.current = true;
    setPending(true);
    try {
      const result = await action(...args);
      const success =
        typeof options.success === 'function'
          ? options.success(result)
          : options.success;
      if (success) {
        notifySuccess(success);
      }
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      notifyError(getErrorMessage(error));
      return undefined;
    } finally {
      running.current = false;
      setPending(false);
    }
  }

  return { run, pending };
}
