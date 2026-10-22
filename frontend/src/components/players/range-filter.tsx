'use client';

import { useState } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { FormField, fieldDescribedBy } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface Range {
  min?: number;
  max?: number;
}

interface RangeFilterProps {
  id: string;
  label: string;
  title: string;
  icon: LucideIcon;
  limits: { min: number; max: number };
  decimals: number;
  value: Range;
  format: (value: number) => string;
  onChange: (value: Range) => void;
}

interface RangeErrors {
  min?: string;
  max?: string;
}

function toText(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

function parse(text: string): number | undefined | null {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '') {
    return undefined;
  }
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function RangeFilter({
  id,
  label,
  title,
  icon: Icon,
  limits,
  decimals,
  value,
  format,
  onChange,
}: RangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [minText, setMinText] = useState('');
  const [maxText, setMaxText] = useState('');
  const [errors, setErrors] = useState<RangeErrors>({});
  const active = value.min !== undefined || value.max !== undefined;
  const summary = `${format(value.min ?? limits.min)} a ${format(value.max ?? limits.max)}`;
  const limitsText = `Use um valor de ${format(limits.min)} a ${format(limits.max)}.`;

  function openChange(next: boolean) {
    if (next) {
      setMinText(toText(value.min));
      setMaxText(toText(value.max));
      setErrors({});
    }
    setOpen(next);
  }

  function check(number: number | undefined | null): string | undefined {
    if (number === null) {
      return 'Informe um número.';
    }
    if (number === undefined) {
      return undefined;
    }
    const scale = 10 ** decimals;
    if (Math.round(number * scale) !== number * scale) {
      return decimals === 0
        ? 'Use um número inteiro.'
        : `Use até ${decimals} casas decimais.`;
    }
    return number < limits.min || number > limits.max ? limitsText : undefined;
  }

  function apply() {
    const min = parse(minText);
    const max = parse(maxText);
    const next: RangeErrors = { min: check(min), max: check(max) };
    if (
      !next.min &&
      !next.max &&
      typeof min === 'number' &&
      typeof max === 'number' &&
      min > max
    ) {
      next.max = 'O máximo não pode ser menor que o mínimo.';
    }
    setErrors(next);
    if (next.min || next.max) {
      return;
    }
    onChange({ min: min ?? undefined, max: max ?? undefined });
    setOpen(false);
  }

  function clear() {
    onChange({});
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={openChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="font-normal">
          <Icon data-icon="inline-start" className="text-muted-foreground" />
          {active ? `${label}: ${summary}` : title}
          <ChevronDown
            data-icon="inline-end"
            className="text-muted-foreground"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-4 p-4">
        <p className="font-medium">{title}</p>
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField id={`${id}-min`} label="Mínimo" error={errors.min}>
              <Input
                id={`${id}-min`}
                inputMode={decimals === 0 ? 'numeric' : 'decimal'}
                placeholder={format(limits.min)}
                value={minText}
                aria-invalid={Boolean(errors.min)}
                aria-describedby={fieldDescribedBy(`${id}-min`, {
                  error: errors.min,
                })}
                onChange={(event) => setMinText(event.target.value)}
              />
            </FormField>
            <FormField id={`${id}-max`} label="Máximo" error={errors.max}>
              <Input
                id={`${id}-max`}
                inputMode={decimals === 0 ? 'numeric' : 'decimal'}
                placeholder={format(limits.max)}
                value={maxText}
                aria-invalid={Boolean(errors.max)}
                aria-describedby={fieldDescribedBy(`${id}-max`, {
                  error: errors.max,
                })}
                onChange={(event) => setMaxText(event.target.value)}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={clear}>
              Limpar
            </Button>
            <Button type="submit" size="sm">
              Aplicar
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
