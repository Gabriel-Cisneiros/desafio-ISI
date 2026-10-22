import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from 'cn';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  helper?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  error,
  helper,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-start gap-1.5 text-xs text-destructive"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        helper && (
          <p id={`${id}-helper`} className="text-xs text-muted-foreground">
            {helper}
          </p>
        )
      )}
    </div>
  );
}

export function fieldDescribedBy(
  id: string,
  { error, helper }: { error?: string; helper?: ReactNode },
): string | undefined {
  if (error) {
    return `${id}-error`;
  }
  return helper ? `${id}-helper` : undefined;
}
