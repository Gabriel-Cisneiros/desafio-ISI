'use client';

import { useRef, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import {
  type FeedbackContent,
  notifyError,
  notifySuccess,
} from '@/stores/feedback-store';
import { refreshData } from '@/stores/refresh-store';

interface ApiActionOptions<R> {
  errorTitle: string;
  success?: FeedbackContent | ((result: R) => FeedbackContent);
  onSuccess?: (result: R) => void;
}

export interface ApiAction<A extends unknown[], R> {
  run: (...args: A) => Promise<R | undefined>;
  pending: boolean;
}

export function useApiAction<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  options: ApiActionOptions<R>,
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
      refreshData();
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      notifyError({
        title: options.errorTitle,
        description: getErrorMessage(error),
      });
      return undefined;
    } finally {
      running.current = false;
      setPending(false);
    }
  }

  return { run, pending };
}
