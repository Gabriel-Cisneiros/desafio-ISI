'use client';

import type { ReactNode } from 'react';
import { useField, useFormikContext } from 'formik';
import type { LucideIcon } from 'lucide-react';
import { cn } from 'cn';
import { FormField, fieldDescribedBy } from '@/components/shared/form-field';
import { Input } from '@/components/ui/input';

export function useShownError(name: string): string | undefined {
  const { submitCount } = useFormikContext();
  const [, meta] = useField(name);
  return submitCount > 0 ? meta.error : undefined;
}

export interface FormikTextFieldProps {
  id: string;
  name: string;
  label: string;
  helper?: ReactNode;
  icon?: LucideIcon;
  numeric?: boolean;
  maxLength?: number;
  invalid?: boolean;
  transform?: (value: string) => string;
  className?: string;
}

export function FormikTextField({
  id,
  name,
  label,
  helper,
  icon: Icon,
  numeric = false,
  maxLength,
  invalid = false,
  transform,
  className,
}: FormikTextFieldProps) {
  const [field, , helpers] = useField<string>(name);
  const error = useShownError(name);

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
          onChange={
            transform
              ? (event) => helpers.setValue(transform(event.target.value))
              : field.onChange
          }
          inputMode={numeric ? 'numeric' : undefined}
          maxLength={maxLength}
          autoComplete="off"
          className={cn(Icon && 'pl-9')}
          aria-invalid={Boolean(error) || invalid}
          aria-describedby={fieldDescribedBy(id, { error, helper })}
        />
      </div>
    </FormField>
  );
}
