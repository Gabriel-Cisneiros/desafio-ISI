'use client';

import { useEffect } from 'react';
import { CircleCheck, CircleX, Info, X } from 'lucide-react';
import { cn } from 'cn';
import {
  type Feedback,
  type FeedbackType,
  useFeedbackStore,
} from '@/stores/feedback-store';

export const TOAST_DURATION_MS = 5000;

const ICONS: Record<FeedbackType, typeof Info> = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
};

const ICON_COLORS: Record<FeedbackType, string> = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-foreground',
};

function Toast({ item }: { item: Feedback }) {
  const dismiss = useFeedbackStore((state) => state.dismiss);
  const Icon = ICONS[item.type];

  useEffect(() => {
    const timer = setTimeout(() => dismiss(item.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [dismiss, item.id]);

  return (
    <div
      role={item.type === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg"
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', ICON_COLORS[item.type])} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.title}</p>
        {item.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label="Fechar notificação"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const items = useFeedbackStore((state) => state.items);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
    >
      {items.map((item) => (
        <Toast key={item.id} item={item} />
      ))}
    </div>
  );
}
