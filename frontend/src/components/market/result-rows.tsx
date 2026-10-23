import type { ReactNode } from 'react';
import { CircleCheck } from 'lucide-react';
import { cn } from 'cn';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ResultRow {
  label: string;
  description?: string;
  value: ReactNode;
  strong?: boolean;
}

export function ResultRows({ rows }: { rows: ResultRow[] }) {
  return (
    <dl className="divide-y overflow-hidden rounded-lg border">
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn(
            'flex items-center justify-between gap-4 px-4 py-3',
            row.strong && 'bg-muted-subtle',
          )}
        >
          <dt className="flex flex-col gap-0.5">
            <span
              className={cn(
                row.strong ? 'font-semibold' : 'text-muted-foreground',
              )}
            >
              {row.label}
            </span>
            {row.description && (
              <span className="text-xs text-muted-foreground">
                {row.description}
              </span>
            )}
          </dt>
          <dd
            className={cn(
              'font-medium',
              row.strong && 'text-base font-semibold',
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SuccessHeader({
  title,
  description,
}: {
  title: string;
  description: ReactNode;
}) {
  return (
    <DialogHeader className="gap-4">
      <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success">
        <CircleCheck className="size-5" />
      </span>
      <div className="flex flex-col gap-2">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </div>
    </DialogHeader>
  );
}
