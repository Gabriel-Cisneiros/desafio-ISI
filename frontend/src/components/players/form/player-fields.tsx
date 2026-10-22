'use client';

import type { ReactNode } from 'react';
import { useField, useFormikContext } from 'formik';
import { Lock, type LucideIcon } from 'lucide-react';
import { cn } from 'cn';
import { FormField, fieldDescribedBy } from '@/components/shared/form-field';
import { Input } from '@/components/ui/input';
import { POSITIONS, type Position } from '@/lib/api/types/enums';
import { POSITION_LABELS } from '@/lib/labels';

export function useShownError(name: string): string | undefined {
  const { submitCount } = useFormikContext();
  const [, meta] = useField(name);
  return submitCount > 0 ? meta.error : undefined;
}

interface TextFieldProps {
  name: string;
  label: string;
  helper?: ReactNode;
  icon?: LucideIcon;
  numeric?: boolean;
  maxLength?: number;
  className?: string;
}

export function TextField({
  name,
  label,
  helper,
  icon: Icon,
  numeric = false,
  maxLength,
  className,
}: TextFieldProps) {
  const [field] = useField<string>(name);
  const error = useShownError(name);
  const id = `player-${name}`;

  return (
    <FormField
      id={id}
      label={label}
      error={error}
      helper={helper}
      className={className}
    >
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          id={id}
          {...field}
          inputMode={numeric ? 'numeric' : undefined}
          maxLength={maxLength}
          autoComplete="off"
          className={cn(Icon && 'pl-9')}
          aria-invalid={Boolean(error)}
          aria-describedby={fieldDescribedBy(id, { error, helper })}
        />
      </div>
    </FormField>
  );
}

interface LockedFieldProps {
  label: string;
  helper: string;
}

export function LockedField({ label, helper }: LockedFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm leading-none font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex h-9 items-center gap-2 rounded-md border border-dashed bg-muted-subtle px-3 text-muted-foreground">
        <Lock className="size-4" />
        Após salvar
      </div>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

interface PositionFieldProps {
  locked?: boolean;
}

export function PositionField({ locked = false }: PositionFieldProps) {
  const [field, , helpers] = useField<Position | ''>('position');
  const error = useShownError('position');
  const helper = locked
    ? 'Jogador com clube não muda de posição: as outras posições ficam desabilitadas.'
    : undefined;

  return (
    <FormField
      id="player-position"
      label="Posição"
      error={error}
      helper={helper}
    >
      <div
        id="player-position"
        role="radiogroup"
        aria-label="Posição"
        aria-describedby={fieldDescribedBy('player-position', {
          error,
          helper,
        })}
        className="grid grid-cols-5 gap-2"
      >
        {POSITIONS.map((position) => {
          const selected = field.value === position;
          return (
            <button
              key={position}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={locked && !selected}
              onClick={() => helpers.setValue(position)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg border bg-background px-2 py-2.5 transition-colors outline-none hover:bg-muted-subtle focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:text-muted-foreground disabled:opacity-60',
                selected &&
                  'border-primary bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft',
              )}
            >
              <span className="text-sm font-semibold">{position}</span>
              <span
                className={cn(
                  'text-xs',
                  selected
                    ? 'text-primary-soft-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {POSITION_LABELS[position]}
              </span>
            </button>
          );
        })}
      </div>
    </FormField>
  );
}
