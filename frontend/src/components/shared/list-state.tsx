import type { ReactNode } from 'react';
import { RefreshCw, ServerOff, type LucideIcon } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';

interface StateMessageProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function StateMessage({
  icon: Icon,
  title,
  description,
  action,
  className,
}: StateMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border bg-card px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <StateMessage
      icon={ServerOff}
      title={title}
      description={message}
      className={className}
      action={
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw data-icon="inline-start" />
          Tentar de novo
        </Button>
      }
    />
  );
}
